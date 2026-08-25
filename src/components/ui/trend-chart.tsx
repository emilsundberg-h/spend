"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { kr } from "@/lib/format";
import type { MonthTotal } from "@/lib/aggregate";

/**
 * "Trend over time" -> line/area, single series -> one hue (dataviz skill).
 * A single series needs no legend — the card title already names it. Exact
 * per-month values live in the tooltip rather than a label on every point.
 */
export function TrendChart({ months }: { months: MonthTotal[] }) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={months} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-2)", fontSize: 12, fontWeight: 600 }}
        />
        <Tooltip
          cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
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
        <Area
          type="monotone"
          dataKey="total"
          stroke="var(--accent)"
          strokeWidth={2}
          fill="var(--accent)"
          fillOpacity={0.1}
          dot={{ r: 3, fill: "var(--accent)", strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "var(--accent)", strokeWidth: 2, stroke: "var(--surface)" }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
