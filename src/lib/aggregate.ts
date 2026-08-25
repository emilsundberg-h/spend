import { formatMonth, parseLocalDate } from "./format";
import type { Expense } from "./types";

export function isSameMonth(dateOnly: string, ref: Date): boolean {
  const d = parseLocalDate(dateOnly);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

/** Filters by the purchase date (`e.date`), not when the row was inserted. */
export function expensesForMonth(expenses: Expense[], ref: Date): Expense[] {
  return expenses.filter((e) => isSameMonth(e.date, ref));
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

export interface TagTotal {
  tag: string;
  total: number;
  count: number;
}

/** Same idea as groupByCategory, but by tag — untagged expenses are excluded, not bucketed. */
export function groupByTag(expenses: Expense[]): TagTotal[] {
  const map = new Map<string, TagTotal>();
  for (const e of expenses) {
    if (!e.tag) continue;
    const entry = map.get(e.tag) ?? { tag: e.tag, total: 0, count: 0 };
    entry.total += e.amount;
    entry.count += 1;
    map.set(e.tag, entry);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export interface MonthTotal {
  /** "2026-03" — stable sort/lookup key. */
  key: string;
  /** "Mar", "Apr" — short label for the chart's x-axis. */
  label: string;
  total: number;
}

/** Totals for the `months` calendar months up to and including `ref`'s, oldest first. */
export function monthlyTotals(expenses: Expense[], ref: Date, months = 6): MonthTotal[] {
  const buckets: MonthTotal[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: formatMonth(d).slice(0, 3),
      total: 0,
    });
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const e of expenses) {
    const d = parseLocalDate(e.date);
    const bucket = byKey.get(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    if (bucket) bucket.total += e.amount;
  }
  return buckets;
}
