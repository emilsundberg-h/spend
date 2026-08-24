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

/**
 * Parses a "YYYY-MM-DD" date-only string (as stored for `Expense.date`) as a
 * local calendar date. `new Date("YYYY-MM-DD")` parses that as UTC midnight,
 * which can land on the wrong side of local midnight — this always means the
 * calendar day the string names, regardless of timezone.
 */
export function parseLocalDate(dateOnly: string): Date {
  const [year, month, day] = dateOnly.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Today's date as "YYYY-MM-DD" in local time — matches parseLocalDate's convention. */
export function todayLocalISODate(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** "Idag" / "Igår" / "12 aug", matching the design's relative day labels. */
export function formatRelativeDay(dateOnly: string): string {
  const d = parseLocalDate(dateOnly);
  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);

  if (diffDays === 0) return "Idag";
  if (diffDays === 1) return "Igår";
  return d.toLocaleDateString("sv-SE", { day: "numeric", month: "short" });
}
