export const CATEGORIES = [
  "Mat/matvaror",
  "Restaurang & fika",
  "Transport",
  "Hem & möbler",
  "Nöje",
  "Hälsa",
  "Kläder",
  "Prenumerationer",
  "Övrigt",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Categories typed in before via "Övrigt" that aren't one of the fixed tiles. */
export function customCategoriesFrom(expenses: { category: string }[]): string[] {
  const known = new Set<string>(CATEGORIES);
  const extra = new Set<string>();
  for (const e of expenses) {
    if (!known.has(e.category)) extra.add(e.category);
  }
  return [...extra].sort((a, b) => a.localeCompare(b, "sv"));
}
