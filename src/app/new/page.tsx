"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FIXED_CATEGORIES, OTHER_CATEGORY, customCategoriesFrom } from "@/lib/categories";
import { useExpenses } from "@/lib/expenses-context";
import { BackLink } from "@/components/ui/back-link";
import { CategoryTile } from "@/components/ui/category-tile";
import { Tile } from "@/components/ui/tile";

export default function NewExpensePage() {
  const router = useRouter();
  const { expenses, hiddenCategories, hideCategory } = useExpenses();
  const [customizing, setCustomizing] = useState(false);
  const [customName, setCustomName] = useState("");

  // "Övrigt" itself always stays last — it's the "type a new one" trigger,
  // not a category you'd pick again — so custom ones are inserted before it.
  // Both lists exclude anything hidden (long-press-deleted) from the picker.
  const fixedCategories = useMemo(
    () => FIXED_CATEGORIES.filter((c) => !hiddenCategories.includes(c)),
    [hiddenCategories],
  );
  // Surfaced so picking the same custom category again doesn't mean
  // retyping it (and risking a typo that'd split it into a near-duplicate).
  const customCategories = useMemo(
    () => customCategoriesFrom(expenses).filter((c) => !hiddenCategories.includes(c)),
    [expenses, hiddenCategories],
  );

  function goToCategory(category: string) {
    router.push(`/new/${encodeURIComponent(category)}`);
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
      <h1 className="mb-2 mt-5 font-display text-[28px] font-extrabold tracking-tight text-foreground">
        Vad köpte ni?
      </h1>
      <p className="mb-4 text-sm leading-relaxed text-muted-2">Håll inne en kategori för att ta bort den.</p>
      <div className="grid grid-cols-2 gap-2.5">
        {fixedCategories.map((category) => (
          <CategoryTile
            key={category}
            label={category}
            href={`/new/${encodeURIComponent(category)}`}
            onDelete={() => hideCategory(category)}
          />
        ))}
        {customCategories.map((category) => (
          <CategoryTile
            key={category}
            label={category}
            href={`/new/${encodeURIComponent(category)}`}
            onDelete={() => hideCategory(category)}
          />
        ))}
        <Tile label={OTHER_CATEGORY} onClick={() => setCustomizing(true)} />
      </div>
    </div>
  );
}
