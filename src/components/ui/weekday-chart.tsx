"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { kr } from "@/lib/format";
import type { WeekdayTotal } from "@/lib/aggregate";

const FULL_DAY_NAME: Record<string, string> = {
  Mån: "måndagar",
  Tis: "tisdagar",
  Ons: "onsdagar",
  Tor: "torsdagar",
  Fre: "fredagar",
  Lör: "lördagar",
  Sön: "söndagar",
};

/**
 * "One series is the point, rest are context" -> emphasis, not a 7-color
 * categorical set (dataviz skill): the single highest-spending weekday
 * carries the accent, every other day recedes into the same de-emphasis
 * gray used for inactive chips elsewhere in the app.
 */
export function WeekdayChart({ days }: { days: WeekdayTotal[] }) {
  const maxTotal = Math.max(...days.map((d) => d.total));
  const top = maxTotal > 0 ? days.find((d) => d.total === maxTotal) : undefined;

  return (
    <div>
      {top ? (
        <p className="mb-1 text-sm text-muted-2">
          Mest utgifter på <span className="font-semibold text-foreground">{FULL_DAY_NAME[top.label]}</span>
        </p>
      ) : null}
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={days} margin={{ top: 8, right: 4, bottom: 0, left: 4 }} barCategoryGap={12}>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-2)", fontSize: 12, fontWeight: 600 }}
          />
          <Tooltip
            cursor={{ fill: "var(--surface-2)" }}
            contentStyle={{
              background: "var(--surface)",
              border: "none",
              borderRadius: 12,
              boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
              padding: "8px 12px",
            }}
            labelStyle={{ color: "var(--foreground)", fontWeight: 600, fontSize: 13, marginBottom: 2 }}
            itemStyle={{ color: "var(--muted-2)", fontSize: 13, padding: 0 }}
            formatter={(value) => [`${kr(Number(value))} kr`, "Totalt"]}
          />
          <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={28} isAnimationActive={false}>
            {days.map((d) => (
              <Cell key={d.label} fill={d.total === maxTotal && maxTotal > 0 ? "var(--accent)" : "var(--chip-bg)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
