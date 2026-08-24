export interface HouseholdMember {
  id: string;
  displayName: string;
}

export interface Expense {
  id: string;
  category: string;
  /** Whole kr, matches the numpad which has no decimal key. */
  amount: number;
  payerId: string;
  note?: string;
  tag?: string;
  /** ISO date (YYYY-MM-DD) — the day the purchase happened, editable at entry time, defaults to today. */
  date: string;
  /** ISO timestamp — when the row was inserted. Only used to break ties between same-day entries. */
  createdAt: string;
}
