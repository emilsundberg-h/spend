import { formatMonth } from "@/lib/format";

export function MonthNav({
  month,
  canGoNext,
  onPrevious,
  onNext,
}: {
  month: Date;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onPrevious}
        aria-label="Föregående månad"
        className="flex h-6 w-6 items-center justify-center text-base text-muted"
      >
        ‹
      </button>
      <span className="min-w-[6.5em] text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        {formatMonth(month)}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="Nästa månad"
        className="flex h-6 w-6 items-center justify-center text-base text-muted disabled:opacity-25"
      >
        ›
      </button>
    </div>
  );
}
