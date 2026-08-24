import { createAuthedChannel } from "./authed-channel";
import { createClient } from "./client";
import type { Expense, HouseholdMember } from "../types";

// Supabase-backed data layer. Replaces the old localStorage repository
// (src/lib/storage.ts) — same idea (a thin, swappable async layer), now
// talking to Postgres instead. RLS on the `expenses`/`household_members`
// tables is what actually enforces "only this household can see this data";
// these functions assume the caller is already authenticated.
//
// Everything lives in the `utgifter` Postgres schema (not `public`) because
// this Supabase project is shared with other apps — `.schema("utgifter")`
// keeps every query pointed at our own tables. It must be added to
// Project Settings → Data API → Exposed schemas for this to work.

const SCHEMA = "utgifter";

function db() {
  return createClient().schema(SCHEMA);
}

interface ExpenseRow {
  id: string;
  category: string;
  amount: number;
  payer_id: string;
  note: string | null;
  tag: string | null;
  expense_date: string;
  created_at: string;
}

function fromRow(row: ExpenseRow): Expense {
  return {
    id: row.id,
    category: row.category,
    amount: row.amount,
    payerId: row.payer_id,
    note: row.note ?? undefined,
    tag: row.tag ?? undefined,
    date: row.expense_date,
    createdAt: row.created_at,
  };
}

const EXPENSE_COLUMNS = "id, category, amount, payer_id, note, tag, expense_date, created_at";

/** The household the signed-in user belongs to, or null if not linked to one yet. */
export async function getMyHouseholdId(): Promise<string | null> {
  const { data, error } = await db().from("household_members").select("household_id").limit(1).maybeSingle();
  if (error) throw error;
  return data?.household_id ?? null;
}

export async function listExpenses(householdId: string): Promise<Expense[]> {
  const { data, error } = await db()
    .from("expenses")
    .select(EXPENSE_COLUMNS)
    .eq("household_id", householdId)
    // Purchase date first (the user-editable, backdatable field), insertion
    // time only as a tiebreaker between entries logged for the same day.
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ExpenseRow[]).map(fromRow);
}

export interface NewExpenseInput {
  householdId: string;
  category: string;
  amount: number;
  payerId: string;
  note?: string;
  tag?: string;
  /** ISO date (YYYY-MM-DD); defaults to today server-side if omitted. */
  date?: string;
}

export async function insertExpense(input: NewExpenseInput): Promise<Expense> {
  const { data, error } = await db()
    .from("expenses")
    .insert({
      household_id: input.householdId,
      category: input.category,
      amount: input.amount,
      payer_id: input.payerId,
      note: input.note ?? null,
      tag: input.tag ?? null,
      ...(input.date ? { expense_date: input.date } : {}),
    })
    .select(EXPENSE_COLUMNS)
    .single();
  if (error) throw error;
  return fromRow(data as ExpenseRow);
}

interface MemberRow {
  user_id: string;
  profiles: { display_name: string } | null;
}

export async function listHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
  const { data, error } = await db()
    .from("household_members")
    .select("user_id, profiles(display_name)")
    .eq("household_id", householdId)
    .returns<MemberRow[]>();
  if (error) throw error;
  return data.map((row) => ({ id: row.user_id, displayName: row.profiles?.display_name || "Okänd" }));
}

export async function updateMyDisplayName(userId: string, name: string): Promise<void> {
  const { error } = await db().from("profiles").update({ display_name: name }).eq("id", userId);
  if (error) throw error;
}

/** Live-updates the list when either partner adds a purchase. Returns an unsubscribe function. */
export function subscribeToNewExpenses(householdId: string, onInsert: (expense: Expense) => void): () => void {
  return createAuthedChannel(`expenses-${householdId}`, (channel) => {
    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: SCHEMA, table: "expenses", filter: `household_id=eq.${householdId}` },
      (payload) => onInsert(fromRow(payload.new as ExpenseRow)),
    );
  });
}
