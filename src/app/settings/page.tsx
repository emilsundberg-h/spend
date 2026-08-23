"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/cn";
import { useExpenses } from "@/lib/expenses-context";
import { useMounted } from "@/lib/use-mounted";
import { createClient } from "@/lib/supabase/client";
import { BackLink } from "@/components/ui/back-link";

const THEME_OPTIONS = [
  { value: "light", label: "Ljust" },
  { value: "dark", label: "Mörkt" },
  { value: "system", label: "System" },
] as const;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const router = useRouter();
  const { members, userId, setMyDisplayName } = useExpenses();
  const [signingOut, setSigningOut] = useState(false);

  const me = members.find((m) => m.id === userId);

  async function handleSignOut() {
    setSigningOut(true);
    await createClient().auth.signOut();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen flex-col px-6 pb-10 pt-8">
      <BackLink href="/" label="← Tillbaka" />
      <h1 className="mb-6 mt-5 font-display text-[28px] font-extrabold tracking-tight text-foreground">
        Inställningar
      </h1>

      <section className="flex flex-col gap-2.5">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Tema</span>
        <div className="flex gap-1.5 rounded-2xl bg-surface p-1.5">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={cn(
                "flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors",
                mounted && theme === opt.value ? "bg-accent text-accent-foreground" : "text-muted-2",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 flex flex-col gap-2.5">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Ditt namn</span>
        <input
          value={me?.displayName ?? ""}
          onChange={(e) => setMyDisplayName(e.target.value)}
          placeholder="Hur du ska synas för din sambo"
          className="h-12 rounded-2xl bg-surface-2 px-4 text-[15px] text-foreground outline-none"
        />
      </section>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="mt-10 h-12 rounded-2xl bg-surface text-sm font-semibold text-muted-2 disabled:opacity-60"
      >
        {signingOut ? "Loggar ut…" : "Logga ut"}
      </button>
    </div>
  );
}
