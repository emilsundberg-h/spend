// Curated, not randomized (avoids SSR/client hydration mismatches from
// Math.random() and just plain looks more designed than a formula would).
const NOTES = [
  { emoji: "💵", top: 8, size: 1.6, duration: 3.2, delay: 0 },
  { emoji: "💶", top: 55, size: 2.1, duration: 3.8, delay: 0.6 },
  { emoji: "💴", top: 30, size: 1.4, duration: 2.8, delay: 1.2 },
  { emoji: "💸", top: 72, size: 1.8, duration: 3.4, delay: 0.3 },
  { emoji: "💵", top: 5, size: 1.3, duration: 3.0, delay: 1.7 },
] as const;

const COMPACT_NOTES = [
  { emoji: "💵", top: 8, size: 1.1, duration: 2.6, delay: 0 },
  { emoji: "💶", top: 45, size: 1.0, duration: 3.0, delay: 0.5 },
  { emoji: "💸", top: 15, size: 1.05, duration: 2.8, delay: 1.0 },
] as const;

/** Shown while a view is waiting on its first Supabase fetch (`!ready`). */
export function BanknoteLoader({
  label = "Hämtar…",
  compact = false,
}: {
  label?: string;
  compact?: boolean;
}) {
  const notes = compact ? COMPACT_NOTES : NOTES;
  return (
    <div
      role="status"
      className={`banknote-loader relative w-full overflow-hidden ${compact ? "h-11" : "h-28"}`}
    >
      <span className="sr-only">{label}</span>
      {notes.map((note, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            top: `${note.top}%`,
            fontSize: `${note.size}rem`,
            animationDuration: `${note.duration}s`,
            animationDelay: `${note.delay}s`,
          }}
        >
          {note.emoji}
        </span>
      ))}
    </div>
  );
}
