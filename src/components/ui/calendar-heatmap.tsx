"use client";

import { useState } from "react";
import { kr } from "@/lib/format";
import type { DayTotal } from "@/lib/aggregate";

const WEEKDAY_HEADERS = ["M", "T", "O", "T", "F", "L", "S"];

/**
 * A GitHub-contributions-style calendar for the current month: one cell per
 * day, filled with the app's own accent hue blended toward the surface by
 * how much was spent that day (sequential encoding — one hue, more = darker,
 * per the dataviz skill's "compare magnitude on a grid" job). `color-mix`
 * blends the *color* only, so the day number stays fully opaque and legible
 * at every intensity — an `opacity` fade would wash the text out with it.
 * Tap a day for its exact total instead of cramming a value into every cell.
 */
export function CalendarHeatmap({ days }: { days: DayTotal[] }) {
  const [active, setActive] = useState<DayTotal | null>(null);
  const max = Math.max(1, ...days.map((d) => d.total));
  const leadingBlanks = days[0]?.weekday ?? 0;

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-semibold uppercase text-muted-2">
        {WEEKDAY_HEADERS.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className="mt-1.5 grid grid-cols-7 gap-1.5">
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {days.map((d) => {
          const intensity = d.total / max;
          const strong = d.total > 0 && intensity > 0.5;
          return (
            <button
              key={d.day}
              type="button"
              onClick={() => setActive(d)}
              className={`aspect-square rounded-lg text-[11px] font-semibold transition-transform active:scale-90 ${
                strong ? "text-accent-foreground" : "text-muted-2"
              } ${active?.day === d.day ? "ring-2 ring-accent ring-offset-1 ring-offset-surface" : ""}`}
              style={{
                backgroundColor:
                  d.total > 0
                    ? `color-mix(in oklch, var(--accent) ${Math.round(intensity * 100)}%, var(--surface-2))`
                    : "var(--surface-2)",
              }}
            >
              {d.day}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-surface-2 px-3.5 py-2.5 text-sm">
        {active ? (
          <>
            <span className="font-semibold text-foreground">Den {active.day}:e</span>
            <span className="font-mono font-semibold tabular-nums text-foreground">
              {active.total > 0 ? `${kr(active.total)} kr` : "Inga köp"}
            </span>
          </>
        ) : (
          <span className="text-muted-2">Tryck på en dag för att se summan</span>
        )}
      </div>
    </div>
  );
}
