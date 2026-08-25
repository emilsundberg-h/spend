"use client";

import { formatRelativeDay, todayLocalISODate } from "@/lib/format";

/**
 * Compact date pill — no "Datum" label, just the formatted value ("Idag",
 * "Igår", "5 sep"). Native date input is stacked on top at opacity 0 so
 * tapping anywhere on the pill still opens the OS date picker.
 */
export function DateField({ value, onChange }: { value: string; onChange: (date: string) => void }) {
  return (
    <div className="relative flex h-12 flex-none items-center justify-center overflow-hidden rounded-2xl bg-surface-2 px-4">
      <span className="pointer-events-none whitespace-nowrap text-sm font-semibold text-foreground">
        {formatRelativeDay(value)}
      </span>
      <input
        type="date"
        value={value}
        max={todayLocalISODate()}
        onChange={(e) => onChange(e.target.value || todayLocalISODate())}
        aria-label="Datum"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );
}
