"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { expensesForMonth, groupByCategory, groupByTag, monthlyTotals, totalOf } from "@/lib/aggregate";
import { formatMonth, kr } from "@/lib/format";
import { useExpenses } from "@/lib/expenses-context";
import { cn } from "@/lib/cn";
import { BackLink } from "@/components/ui/back-link";
import { BanknoteLoader } from "@/components/ui/banknote-loader";
import { BreakdownChart, type BreakdownRow } from "@/components/ui/breakdown-chart";
import { Card } from "@/components/ui/card";
import { TrendChart } from "@/components/ui/trend-chart";

type View = "category" | "tag";

export default function SummaryPage() {
  const router = useRouter();
  const { expenses, ready } = useExpenses();
  const [view, setView] = useState<View>("category");
  const now = new Date();
  const monthExpenses = expensesForMonth(expenses, now);
  const total = totalOf(monthExpenses);
  const months = monthlyTotals(expenses, now, 6);

  const rows: BreakdownRow[] =
    view === "category"
      ? groupByCategory(monthExpenses).map((c) => ({
          href: `/summary/${encodeURIComponent(c.category)}`,
          label: c.category,
          total: c.total,
          count: c.count,
          category: c.category,
        }))
      : groupByTag(monthExpenses).map((t) => ({
          href: `/summary/tag/${encodeURIComponent(t.tag)}`,
          label: `#${t.tag}`,
          total: t.total,
          count: t.count,
        }));

  const emptyMessage =
    view === "category" ? "Inga köp den här månaden än." : "Inga taggade köp den här månaden än.";

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

      <div className="mt-6 flex gap-1.5 rounded-2xl bg-surface p-1.5">
        {(
          [
            { value: "category", label: "Kategori" },
            { value: "tag", label: "Tagg" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setView(opt.value)}
            className={cn(
              "flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors",
              view === opt.value ? "bg-accent text-accent-foreground" : "text-muted-2",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <Card className="mt-5">
        {!ready ? (
          <BanknoteLoader />
        ) : rows.length === 0 ? (
          <p className="py-6 text-sm leading-relaxed text-muted-2">{emptyMessage}</p>
        ) : (
          <BreakdownChart rows={rows} onSelect={(href) => router.push(href)} />
        )}
      </Card>

      {ready ? (
        <Card className="mt-4">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Senaste 6 månaderna
          </span>
          <TrendChart months={months} />
        </Card>
      ) : null}
    </div>
  );
}
