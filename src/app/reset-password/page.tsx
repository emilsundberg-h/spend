"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

// Supabase's default (non-custom-SMTP) email templates can't be edited, so the
// reset link goes through Supabase's own hosted verify page, which redirects
// here with the session in the URL hash fragment (#access_token=...) — never
// sent to our server. The browser client's detectSessionInUrl picks that up
// automatically and fires a PASSWORD_RECOVERY auth event once it's done, so
// this page waits for that (or an existing session) before showing the form.
type Status = "checking" | "ready" | "invalid";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setStatus("ready");
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setStatus("ready");
    });

    const timeout = setTimeout(() => setStatus((s) => (s === "checking" ? "invalid" : s)), 6000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (password.length < 6) {
      setError("Minst 6 tecken.");
      return;
    }
    if (password !== confirm) {
      setError("Lösenorden matchar inte.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      setError("Kunde inte spara lösenordet. Länken kan ha slutat gälla — begär en ny.");
      return;
    }
    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 pb-16">
      <span className="font-display text-lg font-semibold text-foreground">Utgifter</span>
      <h1 className="mt-3 font-display text-[26px] font-extrabold tracking-tight text-foreground">
        Välj nytt lösenord
      </h1>

      {status === "checking" ? (
        <p className="mt-6 text-sm text-muted-2">Verifierar länken…</p>
      ) : status === "invalid" ? (
        <div className="mt-6 flex flex-col gap-3">
          <p className="text-sm leading-relaxed text-red-500">
            Länken är ogiltig eller har slutat gälla. Begär en ny från inloggningssidan.
          </p>
          <a href="/login" className="text-sm font-semibold text-accent">
            Till inloggningen
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <input
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nytt lösenord"
            className="h-12 rounded-2xl bg-surface-2 px-4 text-[15px] text-foreground outline-none placeholder:text-muted-2"
          />
          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Upprepa lösenordet"
            className="h-12 rounded-2xl bg-surface-2 px-4 text-[15px] text-foreground outline-none placeholder:text-muted-2"
          />

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className={cn(
              "mt-1 h-[52px] rounded-2xl bg-accent text-[15px] font-bold text-accent-foreground transition-opacity",
              submitting && "opacity-60",
            )}
          >
            {submitting ? "Sparar…" : "Spara lösenord"}
          </button>
        </form>
      )}
    </div>
  );
}
