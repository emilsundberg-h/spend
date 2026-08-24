"use client";

import { useState } from "react";
import Link from "next/link";
import { expensesForMonth, groupByCategory, groupByTag, totalOf } from "@/lib/aggregate";
import { formatMonth, kr } from "@/lib/format";
import { useExpenses } from "@/lib/expenses-context";
import { cn } from "@/lib/cn";
import { BackLink } from "@/components/ui/back-link";
import { BanknoteLoader } from "@/components/ui/banknote-loader";
import { ProgressBar } from "@/components/ui/progress-bar";

type View = "category" | "tag";

export default function SummaryPage() {
  const { expenses, ready } = useExpenses();
  const [view, setView] = useState<View>("category");
  const now = new Date();
  const monthExpenses = expensesForMonth(expenses, now);
  const total = totalOf(monthExpenses);

  const rows =
    view === "category"
      ? groupByCategory(monthExpenses).map((c) => ({
          key: c.category,
          label: c.category,
          href: `/summary/${encodeURIComponent(c.category)}`,
          total: c.total,
          count: c.count,
        }))
      : groupByTag(monthExpenses).map((t) => ({
          key: t.tag,
          label: `#${t.tag}`,
          href: `/summary/tag/${encodeURIComponent(t.tag)}`,
          total: t.total,
          count: t.count,
        }));
  const max = Math.max(1, ...rows.map((r) => r.total));

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

      <div className="mt-5 flex flex-1 flex-col gap-2.5">
        {!ready ? (
          <BanknoteLoader />
        ) : rows.length === 0 ? (
          <p className="text-sm leading-relaxed text-muted-2">{emptyMessage}</p>
        ) : (
          rows.map((r) => (
            <Link key={r.key} href={r.href} className="rounded-2xl bg-surface px-4 py-3.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[15px] font-semibold text-foreground">
                  {r.label} <span className="text-[13px] font-normal text-muted-2">{r.count} köp</span>
                </span>
                <span className="font-mono text-[15px] font-semibold tabular-nums text-foreground">
                  {kr(r.total)} kr
                </span>
              </div>
              <ProgressBar percent={(r.total / max) * 100} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
