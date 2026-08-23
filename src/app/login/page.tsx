"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      setError("Fel e-post eller lösenord.");
      return;
    }
    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 pb-16">
      <span className="font-display text-lg font-semibold text-foreground">Utgifter</span>
      <h1 className="mt-3 font-display text-[26px] font-extrabold tracking-tight text-foreground">Logga in</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-post"
          className="h-12 rounded-2xl bg-surface-2 px-4 text-[15px] text-foreground outline-none placeholder:text-muted-2"
        />
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Lösenord"
          className="h-12 rounded-2xl bg-surface-2 px-4 text-[15px] text-foreground outline-none placeholder:text-muted-2"
        />

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "mt-1 h-[52px] rounded-2xl text-[15px] font-bold text-accent-foreground transition-opacity",
            "bg-accent",
            submitting && "opacity-60",
          )}
        >
          {submitting ? "Loggar in…" : "Logga in"}
        </button>
      </form>
    </div>
  );
}
