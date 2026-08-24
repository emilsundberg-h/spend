"use client";

import { use } from "react";
import { formatRelativeDay, kr } from "@/lib/format";
import { useExpenses } from "@/lib/expenses-context";
import { nameFor } from "@/lib/members";
import { BackLink } from "@/components/ui/back-link";
import { BanknoteLoader } from "@/components/ui/banknote-loader";
import { TagBadge } from "@/components/ui/tag-badge";

export default function CategoryDetailPage(props: PageProps<"/summary/[category]">) {
  // Route params come through still percent-encoded (categories contain "/" and "&"),
  // so decode before using the value for display or matching.
  const { category: rawCategory } = use(props.params);
  const category = decodeURIComponent(rawCategory);
  const { expenses, members, ready } = useExpenses();

  const items = expenses
    .filter((e) => e.category === category)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  const total = items.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex min-h-screen flex-col px-6 pb-10 pt-8">
      <BackLink href="/summary" label="← Summering" />
      <h1 className="mt-5 font-display text-[26px] font-extrabold tracking-tight text-foreground">{category}</h1>
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
            <div key={e.id} className="rounded-2xl bg-surface px-4 py-3.5">
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
                <p className="mt-2 border-l-2 border-accent pl-3 text-sm leading-relaxed text-foreground/80">
                  {e.note}
                </p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
