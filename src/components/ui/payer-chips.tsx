"use client";

import { cn } from "@/lib/cn";
import type { HouseholdMember } from "@/lib/types";

export function PayerChips({
  members,
  value,
  onChange,
}: {
  members: HouseholdMember[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex w-full max-w-[280px] gap-2">
      {members.map((member) => {
        const active = value === member.id;
        return (
          <button
            key={member.id}
            type="button"
            onClick={() => onChange(member.id)}
            className={cn(
              "flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors",
              active ? "bg-accent text-accent-foreground" : "bg-chip-bg text-chip-foreground",
            )}
          >
            {member.displayName}
          </button>
        );
      })}
    </div>
  );
}
