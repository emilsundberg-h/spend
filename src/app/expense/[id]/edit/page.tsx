"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { CATEGORIES, customCategoriesFrom } from "@/lib/categories";
import { kr, todayLocalISODate } from "@/lib/format";
import { useExpenses } from "@/lib/expenses-context";
import { BanknoteLoader } from "@/components/ui/banknote-loader";
import { Numpad } from "@/components/ui/numpad";
import { PayerChips } from "@/components/ui/payer-chips";

const MAX_DIGITS = 6;

export default function EditExpensePage(props: PageProps<"/expense/[id]/edit">) {
  const { id } = use(props.params);
  const router = useRouter();
  const { expenses, members, ready, editExpense, removeExpense } = useExpenses();

  const existing = expenses.find((e) => e.id === id);

  // All hooks below run unconditionally (before the not-found bailout), as
  // required — they just start out empty/from `existing` once it resolves.
  const [category, setCategory] = useState(existing?.category ?? "");
  const [amt, setAmt] = useState(existing ? String(existing.amount) : "");
  const [payerId, setPayerId] = useState<string | null>(existing?.payerId ?? null);
  const [date, setDate] = useState(existing?.date ?? todayLocalISODate());
  const [tag, setTag] = useState(existing?.tag ?? "");
  const [note, setNote] = useState(existing?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const categoryOptions = useMemo(() => {
    const custom = customCategoriesFrom(expenses).filter((c) => !(CATEGORIES as readonly string[]).includes(c));
    return [...CATEGORIES, ...custom];
  }, [expenses]);

  const amountNumber = amt === "" ? 0 : parseInt(amt, 10);
  const canSave = amountNumber > 0 && !!payerId && !!category;

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col px-6 pb-10 pt-8">
        <BanknoteLoader />
      </div>
    );
  }

  if (!existing) {
    return (
      <div className="flex min-h-screen flex-col px-6 pb-10 pt-8">
        <button type="button" onClick={() => router.back()} className="self-start text-[15px] font-semibold text-muted">
          ← Tillbaka
        </button>
        <p className="mt-6 text-sm leading-relaxed text-muted-2">
          Hittar inte det här köpet — det kan ha tagits bort redan.
        </p>
      </div>
    );
  }

  function press(key: string) {
    if (key === "⌫") {
      setAmt((prev) => prev.slice(0, -1));
      return;
    }
    setAmt((prev) => {
      if (prev.length >= MAX_DIGITS) return prev;
      if (prev === "" && key === "00") return prev;
      return prev + key;
    });
  }

  async function handleSave() {
    if (!canSave || !payerId || saving) return;
    setSaving(true);
    await editExpense({
      id,
      category,
      amount: amountNumber,
      payerId,
      note: note.trim() || undefined,
      tag: tag.trim() || undefined,
      date,
    });
    router.back();
  }

  async function handleDelete() {
    if (deleting) return;
    if (!window.confirm("Ta bort det här köpet?")) return;
    setDeleting(true);
    await removeExpense(id);
    router.back();
  }

  return (
    <div className="flex min-h-screen flex-col px-6 pb-10 pt-8">
      <button type="button" onClick={() => router.back()} className="self-start text-[15px] font-semibold text-muted">
        ← Avbryt
      </button>

      <div className="mt-5 flex w-full gap-2 overflow-x-auto pb-1">
        {categoryOptions.map((c) => {
          const active = c === category;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "flex-none rounded-2xl px-3.5 py-2 text-sm font-semibold transition-colors",
                active ? "bg-accent text-accent-foreground" : "bg-chip-bg text-chip-foreground",
              )}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-5 py-6">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[64px] font-bold leading-none tracking-tight tabular-nums text-foreground">
            {amt === "" ? "0" : kr(amountNumber)}
          </span>
          <span className="text-2xl font-semibold text-muted">kr</span>
        </div>
        <PayerChips members={members} value={payerId} onChange={setPayerId} />

        <label className="flex h-12 w-full max-w-[280px] items-center justify-between rounded-2xl bg-surface-2 px-4">
          <span className="text-sm font-semibold text-muted-2">Datum</span>
          <input
            type="date"
            value={date}
            max={todayLocalISODate()}
            onChange={(e) => setDate(e.target.value || todayLocalISODate())}
            className="bg-transparent text-sm font-semibold text-foreground outline-none [color-scheme:light] dark:[color-scheme:dark]"
          />
        </label>

        <input
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="Tagg, t.ex. onödigt eller lyx (valfritt)"
          className="h-12 w-full max-w-[280px] rounded-2xl bg-surface-2 px-4 text-center text-sm text-foreground outline-none placeholder:text-muted-2"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Lägg till info, t.ex. vad eller var"
          className="h-12 w-full max-w-[280px] rounded-2xl bg-surface-2 px-4 text-center text-sm text-foreground outline-none placeholder:text-muted-2"
        />
      </div>

      <Numpad onPress={press} />

      <button
        type="button"
        onClick={handleSave}
        disabled={!canSave || saving}
        className={cn(
          "h-[62px] rounded-[18px] text-[17px] font-bold transition-colors",
          canSave ? "bg-accent text-accent-foreground" : "bg-chip-bg text-chip-foreground",
        )}
      >
        {saving ? "Sparar…" : "Spara ändringar"}
      </button>

      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="mt-3 h-12 text-sm font-semibold text-red-500 disabled:opacity-60"
      >
        {deleting ? "Tar bort…" : "Ta bort köpet"}
      </button>
    </div>
  );
}
