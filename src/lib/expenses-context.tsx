"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createClient } from "./supabase/client";
import {
  getMyHouseholdId,
  insertExpense,
  listExpenses,
  listHouseholdMembers,
  subscribeToNewExpenses,
  updateMyDisplayName,
} from "./supabase/data";
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

interface ExpensesContextValue {
  expenses: Expense[];
  members: HouseholdMember[];
  userId: string | null;
  /** False until the initial Supabase fetch (household + expenses + members) has finished. */
  ready: boolean;
  addExpense: (input: NewExpenseInput) => Promise<void>;
  setMyDisplayName: (name: string) => Promise<void>;
  /** Re-runs the initial fetch on demand — used by pull-to-refresh. */
  refresh: () => Promise<void>;
}

const ExpensesContext = createContext<ExpensesContextValue | null>(null);

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
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

    const [loadedExpenses, loadedMembers] = await Promise.all([listExpenses(hid), listHouseholdMembers(hid)]);
    if (!mounted.current) return;
    setExpenses(loadedExpenses);
    setMembers(loadedMembers);
    setReady(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Live-updates the list when the other person adds a purchase.
  useEffect(() => {
    if (!householdId) return;
    return subscribeToNewExpenses(householdId, (expense) => {
      setExpenses((prev) => insertSorted(prev, expense));
    });
  }, [householdId]);

  async function addExpense(input: NewExpenseInput) {
    if (!householdId) throw new Error("Inget hushåll kopplat ännu");
    const entry = await insertExpense({ householdId, ...input });
    setExpenses((prev) => insertSorted(prev, entry));
  }

  async function setMyDisplayName(name: string) {
    if (!userId) return;
    await updateMyDisplayName(userId, name);
    setMembers((prev) => prev.map((m) => (m.id === userId ? { ...m, displayName: name } : m)));
  }

  return (
    <ExpensesContext.Provider
      value={{ expenses, members, userId, ready, addExpense, setMyDisplayName, refresh: load }}
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
