"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { useExpenses } from "@/lib/expenses-context";
import { BackLink } from "@/components/ui/back-link";
import { Tile } from "@/components/ui/tile";

const OTHER = "Övrigt";

export default function NewExpensePage() {
  const router = useRouter();
  const { expenses } = useExpenses();
  const [customizing, setCustomizing] = useState(false);
  const [customName, setCustomName] = useState("");

  // Categories typed in before via "Övrigt" that aren't one of the fixed
  // tiles — surfaced so picking the same one again doesn't mean retyping it
  // (and risking a typo that'd split it into a second, near-identical group).
  const customCategories = useMemo(() => {
    const known = new Set<string>(CATEGORIES);
    const extra = new Set<string>();
    for (const e of expenses) {
      if (!known.has(e.category)) extra.add(e.category);
    }
    return [...extra].sort((a, b) => a.localeCompare(b, "sv"));
  }, [expenses]);

  function goToCategory(category: string) {
    router.push(`/new/${encodeURIComponent(category)}`);
  }

  function handleTileClick(category: string) {
    if (category === OTHER) {
      setCustomizing(true);
      return;
    }
    goToCategory(category);
  }

  function confirmCustom() {
    goToCategory(customName.trim() || OTHER);
  }

  if (customizing) {
    return (
      <div className="flex min-h-screen flex-col px-6 pb-10 pt-8">
        <button
          type="button"
          onClick={() => setCustomizing(false)}
          className="self-start text-[15px] font-semibold text-muted"
        >
          ← Kategori
        </button>
        <h1 className="mb-2 mt-5 font-display text-[28px] font-extrabold tracking-tight text-foreground">
          Vad kallar vi det?
        </h1>
        <p className="mb-5 text-sm leading-relaxed text-muted-2">
          Skriv en egen kategori, t.ex. Skönhet. Lämna tomt för att använda Övrigt.
        </p>
        <input
          autoFocus
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && confirmCustom()}
          placeholder={OTHER}
          className="h-12 w-full rounded-2xl bg-surface-2 px-4 text-[15px] text-foreground outline-none placeholder:text-muted-2"
        />
        <button
          type="button"
          onClick={confirmCustom}
          className="mt-5 h-[52px] rounded-[18px] bg-accent text-[17px] font-bold text-accent-foreground"
        >
          Fortsätt
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col px-6 pb-10 pt-8">
      <BackLink href="/" label="✕ Avbryt" />
      <h1 className="mb-4 mt-5 font-display text-[28px] font-extrabold tracking-tight text-foreground">
        Vad köpte ni?
      </h1>
      <div className="grid grid-cols-2 gap-2.5">
        {CATEGORIES.map((category) => (
          <Tile key={category} label={category} onClick={() => handleTileClick(category)} />
        ))}
      </div>

      {customCategories.length > 0 ? (
        <>
          <div className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Egna kategorier</div>
          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            {customCategories.map((category) => (
              <Tile key={category} label={category} href={`/new/${encodeURIComponent(category)}`} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
