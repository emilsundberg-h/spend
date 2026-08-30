"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FIXED_CATEGORIES, OTHER_CATEGORY, customCategoriesFrom } from "@/lib/categories";
import { useExpenses } from "@/lib/expenses-context";
import { BackLink } from "@/components/ui/back-link";
import { Tile } from "@/components/ui/tile";

export default function NewExpensePage() {
  const router = useRouter();
  const { expenses } = useExpenses();
  const [customizing, setCustomizing] = useState(false);
  const [customName, setCustomName] = useState("");

  // Surfaced so picking the same custom category again doesn't mean
  // retyping it (and risking a typo that'd split it into a near-duplicate).
  // "Övrigt" itself always stays last — it's the "type a new one" trigger,
  // not a category you'd pick again — so custom ones are inserted before it.
  const customCategories = useMemo(() => customCategoriesFrom(expenses), [expenses]);

  function goToCategory(category: string) {
    router.push(`/new/${encodeURIComponent(category)}`);
  }

  function handleTileClick(category: string) {
    if (category === OTHER_CATEGORY) {
      setCustomizing(true);
      return;
    }
    goToCategory(category);
  }

  function confirmCustom() {
    goToCategory(customName.trim() || OTHER_CATEGORY);
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
          placeholder={OTHER_CATEGORY}
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
        {FIXED_CATEGORIES.map((category) => (
          <Tile key={category} label={category} onClick={() => handleTileClick(category)} />
        ))}
        {customCategories.map((category) => (
          <Tile key={category} label={category} href={`/new/${encodeURIComponent(category)}`} />
        ))}
        <Tile label={OTHER_CATEGORY} onClick={() => handleTileClick(OTHER_CATEGORY)} />
      </div>
    </div>
  );
}
