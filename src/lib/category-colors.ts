import { CATEGORIES } from "./categories";

// One color slot per fixed category (in CATEGORIES' declared order, minus
// "Övrigt" — that and any custom category typed in through it share the
// neutral "other" slot instead). The dataviz skill's rule: a 9th+ series
// never gets a generated hue — order is the CVD-safety mechanism, so it's
// fixed here, never hashed or cycled. See globals.css for the validated hex
// values behind these tokens (--cat-1..8, --cat-other).
const ORDER = CATEGORIES.filter((c) => c !== "Övrigt");

// Written as literal strings (not built from a template) so Tailwind's
// source scanner can see the class names it needs to generate.
const BG_CLASSES = [
  "bg-cat-1",
  "bg-cat-2",
  "bg-cat-3",
  "bg-cat-4",
  "bg-cat-5",
  "bg-cat-6",
  "bg-cat-7",
  "bg-cat-8",
] as const;

const BORDER_CLASSES = [
  "border-cat-1",
  "border-cat-2",
  "border-cat-3",
  "border-cat-4",
  "border-cat-5",
  "border-cat-6",
  "border-cat-7",
  "border-cat-8",
] as const;

function slotIndex(category: string): number {
  return ORDER.indexOf(category as (typeof ORDER)[number]);
}

/** Tailwind background class for a category's dot/swatch — falls back to the neutral "other" slot. */
export function categoryBgClass(category: string): string {
  const i = slotIndex(category);
  return i === -1 ? "bg-cat-other" : BG_CLASSES[i];
}

/** Tailwind border-color class for a category (e.g. the note's accent rule). */
export function categoryBorderClass(category: string): string {
  const i = slotIndex(category);
  return i === -1 ? "border-cat-other" : BORDER_CLASSES[i];
}

/** CSS var (for chart fills, which need a real color value rather than a Tailwind class). */
export function categoryColorVar(category: string): string {
  const i = slotIndex(category);
  return i === -1 ? "var(--cat-other)" : `var(--cat-${i + 1})`;
}
