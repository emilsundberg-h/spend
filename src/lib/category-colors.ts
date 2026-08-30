import { CATEGORIES } from "./categories";

// One color slot per fixed category (in CATEGORIES' declared order, minus
// "Övrigt" — that shares the neutral "other" slot). The dataviz skill's rule:
// a slot beyond the pool never gets a generated hue — order is the
// CVD-safety mechanism, so it's fixed here, never hashed or cycled. See
// globals.css for the validated hex values behind these tokens (--cat-1..10,
// --cat-other).
const ORDER = CATEGORIES.filter((c) => c !== "Övrigt");

// Two extra slots for user-typed-in custom categories (via "Övrigt") not
// already covered above — also fixed order (alphabetical, stable regardless
// of when each was created or how the current view happens to sort them),
// also validated (see globals.css). A 3rd+ ad-hoc custom category folds into
// the shared neutral --cat-other, same rule as the fixed set past its pool.
const CUSTOM_SLOT_COUNT = 2;

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
  "bg-cat-9",
  "bg-cat-10",
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
  "border-cat-9",
  "border-cat-10",
] as const;

const CUSTOM_BG_CLASSES = ["bg-cat-11", "bg-cat-12"] as const;
const CUSTOM_BORDER_CLASSES = ["border-cat-11", "border-cat-12"] as const;

function slotIndex(category: string): number {
  return ORDER.indexOf(category as (typeof ORDER)[number]);
}

/**
 * Index into the two custom slots, or -1 if `category` isn't a custom
 * category or there are more than two in use. `customCategories` should be
 * `customCategoriesFrom(expenses)` — already alphabetical, which is what
 * makes this stable across renders/sessions without tracking creation order.
 */
function customSlotIndex(category: string, customCategories: string[]): number {
  const i = customCategories.indexOf(category);
  return i === -1 || i >= CUSTOM_SLOT_COUNT ? -1 : i;
}

/** Tailwind background class for a category's dot/swatch — falls back to the neutral "other" slot. */
export function categoryBgClass(category: string, customCategories: string[] = []): string {
  const custom = customSlotIndex(category, customCategories);
  if (custom !== -1) return CUSTOM_BG_CLASSES[custom];
  const i = slotIndex(category);
  return i === -1 ? "bg-cat-other" : BG_CLASSES[i];
}

/** Tailwind border-color class for a category (e.g. the note's accent rule). */
export function categoryBorderClass(category: string, customCategories: string[] = []): string {
  const custom = customSlotIndex(category, customCategories);
  if (custom !== -1) return CUSTOM_BORDER_CLASSES[custom];
  const i = slotIndex(category);
  return i === -1 ? "border-cat-other" : BORDER_CLASSES[i];
}

/** CSS var (for chart fills, which need a real color value rather than a Tailwind class). */
export function categoryColorVar(category: string, customCategories: string[] = []): string {
  const custom = customSlotIndex(category, customCategories);
  if (custom !== -1) return `var(--cat-${11 + custom})`;
  const i = slotIndex(category);
  return i === -1 ? "var(--cat-other)" : `var(--cat-${i + 1})`;
}
