"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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
}

interface ExpensesContextValue {
  expenses: Expense[];
  members: HouseholdMember[];
  userId: string | null;
  /** False until the initial Supabase fetch (household + expenses + members) has finished. */
  ready: boolean;
  addExpense: (input: NewExpenseInput) => Promise<void>;
  setMyDisplayName: (name: string) => Promise<void>;
}

const ExpensesContext = createContext<ExpensesContextValue | null>(null);

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      setUserId(user.id);

      const hid = await getMyHouseholdId();
      if (!hid || cancelled) {
        setReady(true);
        return;
      }
      setHouseholdId(hid);

      const [loadedExpenses, loadedMembers] = await Promise.all([listExpenses(hid), listHouseholdMembers(hid)]);
      if (cancelled) return;
      setExpenses(loadedExpenses);
      setMembers(loadedMembers);
      setReady(true);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Live-updates the list when the other person adds a purchase.
  useEffect(() => {
    if (!householdId) return;
    return subscribeToNewExpenses(householdId, (expense) => {
      setExpenses((prev) => (prev.some((e) => e.id === expense.id) ? prev : [expense, ...prev]));
    });
  }, [householdId]);

  async function addExpense(input: NewExpenseInput) {
    if (!householdId) throw new Error("Inget hushåll kopplat ännu");
    const entry = await insertExpense({ householdId, ...input });
    setExpenses((prev) => (prev.some((e) => e.id === entry.id) ? prev : [entry, ...prev]));
  }

  async function setMyDisplayName(name: string) {
    if (!userId) return;
    await updateMyDisplayName(userId, name);
    setMembers((prev) => prev.map((m) => (m.id === userId ? { ...m, displayName: name } : m)));
  }

  return (
    <ExpensesContext.Provider value={{ expenses, members, userId, ready, addExpense, setMyDisplayName }}>
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses(): ExpensesContextValue {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error("useExpenses must be used within an ExpensesProvider");
  return ctx;
}
