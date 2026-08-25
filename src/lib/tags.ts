/** Distinct tags used before, most-used first — powers the tag picker's suggestions. */
export function distinctTagsFrom(expenses: { tag?: string }[]): string[] {
  const counts = new Map<string, number>();
  for (const e of expenses) {
    if (!e.tag) continue;
    counts.set(e.tag, (counts.get(e.tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "sv"))
    .map(([tag]) => tag);
}
