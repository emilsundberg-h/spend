/** Shown while a view is waiting on its first Supabase fetch (`!ready`) — a single banknote spinning like a coin. */
export function BanknoteLoader({
  label = "Hämtar…",
  compact = false,
}: {
  label?: string;
  compact?: boolean;
}) {
  return (
    <div
      role="status"
      className={`flex w-full items-center justify-center ${compact ? "h-11" : "h-28"}`}
      style={{ perspective: 400 }}
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden className="banknote-spin" style={{ fontSize: compact ? "1.6rem" : "3rem" }}>
        💵
      </span>
    </div>
  );
}
