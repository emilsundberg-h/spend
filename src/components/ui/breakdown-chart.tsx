"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BarRectangleItem } from "recharts";
import { kr } from "@/lib/format";

export interface BreakdownRow {
  /** Where tapping this bar navigates to. */
  href: string;
  label: string;
  total: number;
  count: number;
  /** Category this bar represents, if grouped by category (unused here beyond that). */
  category?: string;
  /**
   * Resolved CSS color (categoryColorVar(...), computed by the caller — it
   * knows the household's custom-category list, this component doesn't).
   * Omitted in the tag view — those bars stay a flat accent.
   */
  color?: string;
}

const ROW_HEIGHT = 44;

/**
 * Horizontal bar chart — the dataviz skill's default form for part-to-whole
 * with long category names (a vertical/pie layout would either clip labels
 * or force a separate legend). One bar per row, tap to open its detail page.
 */
export function BreakdownChart({ rows, onSelect }: { rows: BreakdownRow[]; onSelect: (key: string) => void }) {
  const height = Math.max(ROW_HEIGHT, rows.length * ROW_HEIGHT);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 48, bottom: 0, left: 0 }} barCategoryGap={8}>
        <XAxis type="number" hide domain={[0, (max: number) => max * 1.15]} />
        <YAxis
          type="category"
          dataKey="label"
          width={116}
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
          formatter={(value, _name, item) => {
            const row = item.payload as BreakdownRow;
            return [`${kr(Number(value))} kr`, `${row.count} köp`];
          }}
        />
        <Bar
          dataKey="total"
          radius={[0, 8, 8, 0]}
          maxBarSize={22}
          isAnimationActive={false}
          onClick={(data: BarRectangleItem) => onSelect((data.payload as BreakdownRow).href)}
          cursor="pointer"
          label={{
            position: "right",
            formatter: (value) => `${kr(Number(value))} kr`,
            fill: "var(--foreground)",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {rows.map((r) => (
            <Cell key={r.href} fill={r.color ?? "var(--accent)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
