"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { expensesForMonth, totalOf } from "@/lib/aggregate";
import { customCategoriesFrom } from "@/lib/categories";
import { formatMonth, formatRelativeDay, kr } from "@/lib/format";
import { useExpenses } from "@/lib/expenses-context";
import { nameFor } from "@/lib/members";
import { categoryBgClass } from "@/lib/category-colors";
import { BanknoteLoader } from "@/components/ui/banknote-loader";
import { Card } from "@/components/ui/card";
import { InfoBadge } from "@/components/ui/info-badge";
import { SettingsIcon } from "@/components/ui/settings-icon";
import { SwipeableRow } from "@/components/ui/swipeable-row";
import { TagBadge } from "@/components/ui/tag-badge";

export default function HomePage() {
  const router = useRouter();
  const { expenses, members, ready, removeExpense } = useExpenses();

  async function handleDelete(id: string) {
    if (!window.confirm("Ta bort det här köpet?")) return;
    try {
      await removeExpense(id);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Kunde inte ta bort köpet. Försök igen.");
    }
  }
  const customCategories = useMemo(() => customCategoriesFrom(expenses), [expenses]);
  const now = new Date();
  const monthExpenses = expensesForMonth(expenses, now);
  const total = totalOf(monthExpenses);
  // Already sorted purchase-date desc (see listExpenses/insertSorted) — the
  // whole month, not just a handful of the most recent entries.
  const recent = monthExpenses;

  return (
    <div className="flex min-h-screen flex-col px-6 pb-32 pt-8">
      <header className="flex items-center justify-between">
        <span className="font-display text-lg font-semibold text-foreground">Utgifter</span>
        <Link href="/settings" aria-label="Inställningar" className="text-muted">
          <SettingsIcon className="h-5 w-5" />
        </Link>
      </header>

      <Card className="mt-5">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{formatMonth(now)}</span>
          <Link href="/summary" className="text-sm font-semibold text-accent">
            Summering
          </Link>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="font-mono text-5xl font-bold tracking-tight tabular-nums text-foreground">
            {kr(total)}
          </span>
          <span className="text-lg font-semibold text-muted">kr</span>
        </div>
        <div className="mt-1 text-sm text-muted-2">{monthExpenses.length} köp tillsammans</div>
      </Card>

      <div className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Senaste köpen</div>

      <div className="mt-2.5 flex flex-1 flex-col gap-2">
        {!ready ? (
          <BanknoteLoader />
        ) : recent.length === 0 ? (
          <p className="mt-6 text-sm leading-relaxed text-muted-2">
            Inga köp ännu. Tryck på plusset nedan så fort ni handlat något.
          </p>
        ) : (
          recent.map((e) => (
            <SwipeableRow
              key={e.id}
              onEdit={() => router.push(`/expense/${e.id}/edit`)}
              onDelete={() => handleDelete(e.id)}
            >
              <Link
                href={`/summary/${encodeURIComponent(e.category)}`}
                className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3.5"
              >
                <span className={`h-2 w-2 flex-none rounded-full ${categoryBgClass(e.category, customCategories)}`} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-base font-semibold text-foreground">{e.category}</span>
                    {e.note ? <InfoBadge /> : null}
                    {e.tag ? <TagBadge tag={e.tag} /> : null}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-muted-2">
                    {nameFor(members, e.payerId)} · {formatRelativeDay(e.date)}
                  </span>
                </span>
                <span className="font-mono text-lg font-semibold tabular-nums text-foreground">{kr(e.amount)}</span>
              </Link>
            </SwipeableRow>
          ))
        )}
      </div>

      <Link
        href="/new"
        aria-label="Nytt köp"
        className="fixed inset-x-0 bottom-8 mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-accent text-4xl font-light text-accent-foreground shadow-lg shadow-accent/40"
      >
        +
      </Link>
    </div>
  );
}
