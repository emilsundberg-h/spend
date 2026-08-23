import type { HouseholdMember } from "./types";

export function nameFor(members: HouseholdMember[], id: string): string {
  return members.find((m) => m.id === id)?.displayName || "Okänd";
}
