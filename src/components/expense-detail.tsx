"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { customCategoriesFrom } from "@/lib/categories";
import { formatRelativeDay, kr } from "@/lib/format";
import { useExpenses } from "@/lib/expenses-context";
import { nameFor } from "@/lib/members";
import { categoryBgClass, categoryBorderClass } from "@/lib/category-colors";
import { TagBadge } from "@/components/ui/tag-badge";

/** A single purchase's own details — what a home-screen row's tap opens, in the bottom sheet. */
export function ExpenseDetail({ expenseId, onClose }: { expenseId: string; onClose: () => void }) {
  const router = useRouter();
  const { expenses, members, removeExpense } = useExpenses();
  const [deleting, setDeleting] = useState(false);
  const customCategories = useMemo(() => customCategoriesFrom(expenses), [expenses]);
  const expense = expenses.find((e) => e.id === expenseId);

  if (!expense) {
    return <p className="text-sm leading-relaxed text-muted-2">Hittar inte det här köpet — det kan ha tagits bort redan.</p>;
  }

  async function handleDelete() {
    if (deleting) return;
    if (!window.confirm("Ta bort det här köpet?")) return;
    setDeleting(true);
    try {
      await removeExpense(expense.id);
      onClose();
    } catch (err) {
      setDeleting(false);
      window.alert(err instanceof Error ? err.message : "Kunde inte ta bort köpet. Försök igen.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2.5">
        <span className={`h-3 w-3 flex-none rounded-full ${categoryBgClass(expense.category, customCategories)}`} />
        <h2 className="min-w-0 truncate font-display text-[22px] font-extrabold tracking-tight text-foreground">
          {expense.category}
        </h2>
        {expense.tag ? <TagBadge tag={expense.tag} /> : null}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-5xl font-bold tracking-tight tabular-nums text-foreground">
          {kr(expense.amount)}
        </span>
        <span className="text-xl font-semibold text-muted">kr</span>
      </div>

      <div className="text-[15px] text-muted-2">
        {nameFor(members, expense.payerId)} · {formatRelativeDay(expense.date)}
      </div>

      {expense.note ? (
        <p
          className={`border-l-2 pl-3 text-sm leading-relaxed text-foreground/80 ${categoryBorderClass(expense.category, customCategories)}`}
        >
          {expense.note}
        </p>
      ) : null}

      <div className="mt-2 flex gap-2.5">
        <button
          type="button"
          onClick={() => router.push(`/expense/${expense.id}/edit`)}
          className="h-12 flex-1 rounded-2xl bg-chip-bg text-sm font-bold text-chip-foreground"
        >
          Ändra
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="h-12 flex-1 rounded-2xl bg-red-500 text-sm font-bold text-white disabled:opacity-60"
        >
          {deleting ? "Tar bort…" : "Ta bort"}
        </button>
      </div>
    </div>
  );
}
