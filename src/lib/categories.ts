export const CATEGORIES = [
  "Mat/matvaror",
  "Restaurang & fika",
  "Transport",
  "Hem & möbler",
  "Nöje",
  "Hälsa",
  "Kläder",
  "Prenumerationer",
  "Kalas",
  "Maja",
  "Övrigt",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** The "type your own" trigger — always sorts last, never a pickable custom category itself. */
export const OTHER_CATEGORY = "Övrigt";

export const FIXED_CATEGORIES = CATEGORIES.filter((c) => c !== OTHER_CATEGORY);

/** Categories typed in before via "Övrigt" that aren't one of the fixed tiles. */
export function customCategoriesFrom(expenses: { category: string }[]): string[] {
  const known = new Set<string>(CATEGORIES);
  const extra = new Set<string>();
  for (const e of expenses) {
    if (!known.has(e.category)) extra.add(e.category);
  }
  return [...extra].sort((a, b) => a.localeCompare(b, "sv"));
}
