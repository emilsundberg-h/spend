/** Swedish thousand-space formatting, e.g. 12345 -> "12 345". */
export function kr(amount: number): string {
  return Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function formatMonth(date: Date = new Date()): string {
  const label = date.toLocaleDateString("sv-SE", { month: "long" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** "Idag" / "Igår" / "12 aug", matching the design's relative day labels. */
export function formatRelativeDay(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);

  if (diffDays === 0) return "Idag";
  if (diffDays === 1) return "Igår";
  return d.toLocaleDateString("sv-SE", { day: "numeric", month: "short" });
}
