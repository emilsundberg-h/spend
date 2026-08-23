"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { kr } from "@/lib/format";
import { useExpenses } from "@/lib/expenses-context";
import { BackLink } from "@/components/ui/back-link";
import { Numpad } from "@/components/ui/numpad";
import { PayerChips } from "@/components/ui/payer-chips";

const MAX_DIGITS = 6;

export default function NewExpenseAmountPage(props: PageProps<"/new/[category]">) {
  // Route params come through still percent-encoded (categories contain "/" and "&"),
  // so decode before using the value for display, storage, or matching.
  const { category: rawCategory } = use(props.params);
  const category = decodeURIComponent(rawCategory);
  const router = useRouter();
  const { members, userId, ready, addExpense } = useExpenses();
  const [amt, setAmt] = useState("");
  const [payerId, setPayerId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedPayerId = payerId ?? userId;
  const amountNumber = amt === "" ? 0 : parseInt(amt, 10);
  const canSave = amountNumber > 0 && !!selectedPayerId;

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
    if (!canSave || !selectedPayerId || saving) return;
    setSaving(true);
    await addExpense({ category, amount: amountNumber, payerId: selectedPayerId, note: note.trim() || undefined });
    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col px-6 pb-10 pt-8">
      <BackLink href="/new" label="← Kategori" />

      <div className="flex flex-1 flex-col items-center justify-center gap-5 py-6">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{category}</span>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[64px] font-bold leading-none tracking-tight tabular-nums text-foreground">
            {amt === "" ? "0" : kr(amountNumber)}
          </span>
          <span className="text-2xl font-semibold text-muted">kr</span>
        </div>
        {ready ? <PayerChips members={members} value={selectedPayerId} onChange={setPayerId} /> : null}
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
        {saving ? "Sparar…" : "Spara"}
      </button>
    </div>
  );
}
