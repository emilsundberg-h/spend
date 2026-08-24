"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { formatRelativeDay, kr } from "@/lib/format";
import { useExpenses } from "@/lib/expenses-context";
import { nameFor } from "@/lib/members";
import { BackLink } from "@/components/ui/back-link";
import { BanknoteLoader } from "@/components/ui/banknote-loader";
import { SwipeableRow } from "@/components/ui/swipeable-row";

export default function TagDetailPage(props: PageProps<"/summary/tag/[tag]">) {
  // Tags can contain "/" and "&" like categories, so decode before use.
  const { tag: rawTag } = use(props.params);
  const tag = decodeURIComponent(rawTag);
  const router = useRouter();
  const { expenses, members, ready, removeExpense } = useExpenses();

  async function handleDelete(id: string) {
    if (!window.confirm("Ta bort det här köpet?")) return;
    await removeExpense(id);
  }

  const items = expenses
    .filter((e) => e.tag === tag)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  const total = items.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex min-h-screen flex-col px-6 pb-10 pt-8">
      <BackLink href="/summary" label="← Summering" />
      <h1 className="mt-5 font-display text-[26px] font-extrabold tracking-tight text-foreground">#{tag}</h1>
      <div className="mt-1 text-sm text-muted-2">
        {items.length} köp · {kr(total)} kr
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-2.5">
        {!ready ? (
          <BanknoteLoader />
        ) : items.length === 0 ? (
          <p className="text-sm leading-relaxed text-muted-2">Inga köp med den här taggen än.</p>
        ) : (
          items.map((e) => (
            <SwipeableRow
              key={e.id}
              onEdit={() => router.push(`/expense/${e.id}/edit`)}
              onDelete={() => handleDelete(e.id)}
            >
              <div className="rounded-2xl bg-surface px-4 py-3.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-[15px] text-muted-2">
                    {e.category} · {nameFor(members, e.payerId)} · {formatRelativeDay(e.date)}
                  </span>
                  <span className="flex-none font-mono text-[17px] font-semibold tabular-nums text-foreground">
                    {kr(e.amount)} kr
                  </span>
                </div>
                {e.note ? (
                  <p className="mt-2 border-l-2 border-accent pl-3 text-sm leading-relaxed text-foreground/80">
                    {e.note}
                  </p>
                ) : null}
              </div>
            </SwipeableRow>
          ))
        )}
      </div>
    </div>
  );
}
