"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { customCategoriesFrom } from "@/lib/categories";
import { formatRelativeDay, kr } from "@/lib/format";
import { useExpenses } from "@/lib/expenses-context";
import { nameFor } from "@/lib/members";
import { categoryBgClass, categoryBorderClass } from "@/lib/category-colors";
import { BanknoteLoader } from "@/components/ui/banknote-loader";
import { SwipeableRow } from "@/components/ui/swipeable-row";
import { TagBadge } from "@/components/ui/tag-badge";

/**
 * A category's heading (color dot + name) plus its purchase list — the full
 * body of /summary/[category], also reused as-is inside the home screen's
 * bottom sheet so both presentations stay in sync for free.
 */
export function CategoryPurchaseList({ category }: { category: string }) {
  const router = useRouter();
  const { expenses, members, ready, removeExpense } = useExpenses();
  const customCategories = useMemo(() => customCategoriesFrom(expenses), [expenses]);

  async function handleDelete(id: string) {
    if (!window.confirm("Ta bort det här köpet?")) return;
    try {
      await removeExpense(id);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Kunde inte ta bort köpet. Försök igen.");
    }
  }

  const items = expenses
    .filter((e) => e.category === category)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  const total = items.reduce((sum, e) => sum + e.amount, 0);

  return (
    <>
      <h2 className="flex items-center gap-2.5 font-display text-[26px] font-extrabold tracking-tight text-foreground">
        <span className={`h-3 w-3 flex-none rounded-full ${categoryBgClass(category, customCategories)}`} />
        {category}
      </h2>
      <div className="mt-1 text-sm text-muted-2">
        {items.length} köp · {kr(total)} kr
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-2.5">
        {!ready ? (
          <BanknoteLoader />
        ) : items.length === 0 ? (
          <p className="text-sm leading-relaxed text-muted-2">Inga köp i den här kategorin än.</p>
        ) : (
          items.map((e) => (
            <SwipeableRow
              key={e.id}
              onEdit={() => router.push(`/expense/${e.id}/edit`)}
              onDelete={() => handleDelete(e.id)}
            >
              <div className="rounded-2xl bg-surface px-4 py-3.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-1.5 text-[15px] text-muted-2">
                    <span className="truncate">
                      {nameFor(members, e.payerId)} · {formatRelativeDay(e.date)}
                    </span>
                    {e.tag ? <TagBadge tag={e.tag} /> : null}
                  </span>
                  <span className="flex-none font-mono text-[17px] font-semibold tabular-nums text-foreground">
                    {kr(e.amount)} kr
                  </span>
                </div>
                {e.note ? (
                  <p
                    className={`mt-2 border-l-2 pl-3 text-sm leading-relaxed text-foreground/80 ${categoryBorderClass(category, customCategories)}`}
                  >
                    {e.note}
                  </p>
                ) : null}
              </div>
            </SwipeableRow>
          ))
        )}
      </div>
    </>
  );
}
