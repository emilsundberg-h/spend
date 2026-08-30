"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createClient } from "./supabase/client";
import {
  deleteExpense,
  getMyHouseholdId,
  hideCategory as hideCategoryApi,
  insertExpense,
  listExpenses,
  listHiddenCategories,
  listHouseholdMembers,
  subscribeToExpenseChanges,
  updateExpense,
  updateMyDisplayName,
  type UpdateExpenseInput,
} from "./supabase/data";
import { OTHER_CATEGORY } from "./categories";
import type { Expense, HouseholdMember } from "./types";

interface NewExpenseInput {
  category: string;
  amount: number;
  payerId: string;
  note?: string;
  tag?: string;
  /** ISO date (YYYY-MM-DD); defaults to today server-side if omitted. */
  date?: string;
}

/**
 * Inserts `entry` keeping the list sorted the same way listExpenses() orders
 * it (purchase date desc, then insertion time desc). A plain unshift would
 * be wrong now that a purchase's date is editable — backdating an entry
 * must not put it above ones that actually happened more recently.
 */
function insertSorted(list: Expense[], entry: Expense): Expense[] {
  if (list.some((e) => e.id === entry.id)) return list;
  const idx = list.findIndex((e) => e.date < entry.date || (e.date === entry.date && e.createdAt < entry.createdAt));
  if (idx === -1) return [...list, entry];
  return [...list.slice(0, idx), entry, ...list.slice(idx)];
}

/** Same as insertSorted, but for replacing an existing entry (its date may have changed). */
function replaceSorted(list: Expense[], entry: Expense): Expense[] {
  return insertSorted(
    list.filter((e) => e.id !== entry.id),
    entry,
  );
}

interface ExpensesContextValue {
  expenses: Expense[];
  members: HouseholdMember[];
  userId: string | null;
  /** Categories removed from the picker — CATEGORIES itself never changes, this just filters it. */
  hiddenCategories: string[];
  /** False until the initial Supabase fetch (household + expenses + members) has finished. */
  ready: boolean;
  addExpense: (input: NewExpenseInput) => Promise<void>;
  editExpense: (input: UpdateExpenseInput) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  setMyDisplayName: (name: string) => Promise<void>;
  /** Removes a category from the picker; its existing expenses move to "Övrigt". */
  hideCategory: (category: string) => Promise<void>;
  /** Re-runs the initial fetch on demand — used by pull-to-refresh. */
  refresh: () => Promise<void>;
}

const ExpensesContext = createContext<ExpensesContextValue | null>(null);

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  // The provider sits at the root layout and effectively never unmounts,
  // but this still guards against setting state after a fast unmount
  // (React 18 StrictMode double-invoke, navigating away mid-fetch, etc).
  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  const load = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !mounted.current) return;
    setUserId(user.id);

    const hid = await getMyHouseholdId();
    if (!mounted.current) return;
    if (!hid) {
      setReady(true);
      return;
    }
    setHouseholdId(hid);

    const [loadedExpenses, loadedMembers, loadedHidden] = await Promise.all([
      listExpenses(hid),
      listHouseholdMembers(hid),
      listHiddenCategories(hid),
    ]);
    if (!mounted.current) return;
    setExpenses(loadedExpenses);
    setMembers(loadedMembers);
    setHiddenCategories(loadedHidden);
    setReady(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Live-updates the list when the other person adds, edits, or deletes a purchase.
  useEffect(() => {
    if (!householdId) return;
    return subscribeToExpenseChanges(householdId, {
      onInsert: (expense) => setExpenses((prev) => insertSorted(prev, expense)),
      onUpdate: (expense) => setExpenses((prev) => replaceSorted(prev, expense)),
      onDelete: (id) => setExpenses((prev) => prev.filter((e) => e.id !== id)),
    });
  }, [householdId]);

  async function addExpense(input: NewExpenseInput) {
    if (!householdId) throw new Error("Inget hushåll kopplat ännu");
    const entry = await insertExpense({ householdId, ...input });
    setExpenses((prev) => insertSorted(prev, entry));
  }

  async function editExpense(input: UpdateExpenseInput) {
    const entry = await updateExpense(input);
    setExpenses((prev) => replaceSorted(prev, entry));
  }

  async function removeExpense(id: string) {
    await deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  async function setMyDisplayName(name: string) {
    if (!userId) return;
    await updateMyDisplayName(userId, name);
    setMembers((prev) => prev.map((m) => (m.id === userId ? { ...m, displayName: name } : m)));
  }

  async function hideCategory(category: string) {
    if (!householdId) return;
    await hideCategoryApi(householdId, category);
    setHiddenCategories((prev) => (prev.includes(category) ? prev : [...prev, category]));
    // The realtime UPDATE events for each reassigned row will also arrive
    // and land on this same result, but updating locally now means the
    // person who did it sees it immediately instead of waiting on that.
    setExpenses((prev) => prev.map((e) => (e.category === category ? { ...e, category: OTHER_CATEGORY } : e)));
  }

  return (
    <ExpensesContext.Provider
      value={{
        expenses,
        members,
        userId,
        hiddenCategories,
        ready,
        addExpense,
        editExpense,
        removeExpense,
        setMyDisplayName,
        hideCategory,
        refresh: load,
      }}
    >
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses(): ExpensesContextValue {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error("useExpenses must be used within an ExpensesProvider");
  return ctx;
}
