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
  const [resetSent, setResetSent] = useState(false);
  const [resetting, setResetting] = useState(false);

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

  async function handleForgotPassword() {
    if (resetting) return;
    if (!email) {
      setError("Skriv in din e-post ovan först.");
      return;
    }
    setError(null);
    setResetting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm`,
    });
    setResetting(false);
    // Always show the same confirmation, whether or not the email exists —
    // don't leak account existence through the response.
    if (!error) setResetSent(true);
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 pb-16">
      <span className="font-display text-lg font-semibold text-foreground">Utgifter</span>
      <h1 className="mt-3 font-display text-[26px] font-extrabold tracking-tight text-foreground">Logga in</h1>

      {resetSent ? (
        <p className="mt-6 rounded-2xl bg-surface px-4 py-3.5 text-sm leading-relaxed text-foreground">
          Kolla mejlen — vi har skickat en länk till <strong>{email}</strong> för att välja ett nytt lösenord.
        </p>
      ) : (
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

          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={resetting}
            className="mt-1 self-center text-sm text-muted-2 underline-offset-2 hover:underline disabled:opacity-60"
          >
            {resetting ? "Skickar…" : "Glömt lösenord?"}
          </button>
        </form>
      )}
    </div>
  );
}
