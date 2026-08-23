import type { Expense } from "./types";

export function isSameMonth(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

export function expensesForMonth(expenses: Expense[], ref: Date): Expense[] {
  return expenses.filter((e) => isSameMonth(e.createdAt, ref));
}

export function totalOf(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export interface CategoryTotal {
  category: string;
  total: number;
  count: number;
}

/** Sorted by total, descending — matches the design's summary ordering. */
export function groupByCategory(expenses: Expense[]): CategoryTotal[] {
  const map = new Map<string, CategoryTotal>();
  for (const e of expenses) {
    const entry = map.get(e.category) ?? { category: e.category, total: 0, count: 0 };
    entry.total += e.amount;
    entry.count += 1;
    map.set(e.category, entry);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}
