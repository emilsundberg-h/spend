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
  /** ISO timestamp. */
  createdAt: string;
}
