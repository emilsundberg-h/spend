"use client";

import Link from "next/link";
import { expensesForMonth, groupByCategory, totalOf } from "@/lib/aggregate";
import { formatMonth, kr } from "@/lib/format";
import { useExpenses } from "@/lib/expenses-context";
import { BackLink } from "@/components/ui/back-link";
import { ProgressBar } from "@/components/ui/progress-bar";

export default function SummaryPage() {
  const { expenses, ready } = useExpenses();
  const now = new Date();
  const monthExpenses = expensesForMonth(expenses, now);
  const total = totalOf(monthExpenses);
  const byCategory = groupByCategory(monthExpenses);
  const max = Math.max(1, ...byCategory.map((c) => c.total));

  return (
    <div className="flex min-h-screen flex-col px-6 pb-10 pt-8">
      <BackLink href="/" label="← Tillbaka" />
      <h1 className="mt-5 font-display text-[28px] font-extrabold tracking-tight text-foreground">Summering</h1>
      <div className="mt-1 text-sm text-muted-2">{formatMonth(now)}</div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-mono text-[44px] font-bold tracking-tight tabular-nums text-foreground">
          {kr(total)}
        </span>
        <span className="text-lg font-semibold text-muted">kr</span>
      </div>

      <div className="mt-7 flex flex-1 flex-col gap-2.5">
        {ready && byCategory.length === 0 ? (
          <p className="text-sm leading-relaxed text-muted-2">Inga köp den här månaden än.</p>
        ) : (
          byCategory.map((c) => (
            <Link
              key={c.category}
              href={`/summary/${encodeURIComponent(c.category)}`}
              className="rounded-2xl bg-surface px-4 py-3.5"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[15px] font-semibold text-foreground">
                  {c.category} <span className="text-[13px] font-normal text-muted-2">{c.count} köp</span>
                </span>
                <span className="font-mono text-[15px] font-semibold tabular-nums text-foreground">
                  {kr(c.total)} kr
                </span>
              </div>
              <ProgressBar percent={(c.total / max) * 100} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
