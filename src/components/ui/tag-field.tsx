"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tag pill that opens a small popover on tap: a text field for typing a new
 * tag plus chips for ones already used before, filtered live as you type.
 * Tapping a chip (or pressing Enter, or tapping "Klar") commits and closes;
 * so does tapping outside — like a normal input losing focus. Escape closes
 * without committing.
 */
export function TagField({
  value,
  onChange,
  suggestions,
}: {
  value: string;
  onChange: (tag: string) => void;
  suggestions: string[];
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(value);
    const focusFrame = requestAnimationFrame(() => inputRef.current?.focus());

    function commitAndClose() {
      onChange(draftRef.current.trim());
      setOpen(false);
    }
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) commitAndClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onKey);
    };
    // Deliberately only on `open` — commitAndClose reads the live draft via draftRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function commit(tag: string) {
    onChange(tag.trim());
    setOpen(false);
  }

  const filtered = suggestions.filter((s) => s.toLowerCase().includes(draft.trim().toLowerCase()));

  return (
    <div ref={containerRef} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-full items-center rounded-2xl bg-surface-2 px-4 text-left text-sm font-semibold text-foreground"
      >
        <span className="truncate">{value ? `#${value}` : "Tagg"}</span>
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full z-20 mt-2 rounded-2xl bg-surface p-3 shadow-lg shadow-black/10">
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commit(draft)}
            placeholder="Skriv en tagg, t.ex. lyx"
            className="h-11 w-full rounded-xl bg-surface-2 px-3.5 text-sm text-foreground outline-none placeholder:text-muted-2"
          />

          {filtered.length > 0 ? (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {filtered.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => commit(s)}
                  className="rounded-full bg-chip-bg px-3 py-1.5 text-[13px] font-semibold text-chip-foreground"
                >
                  #{s}
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-2.5 flex items-center justify-between gap-2">
            {value ? (
              <button
                type="button"
                onClick={() => commit("")}
                className="text-[13px] font-semibold text-muted-2"
              >
                Ta bort tagg
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => commit(draft)}
              className="rounded-full bg-accent px-4 py-1.5 text-[13px] font-bold text-accent-foreground"
            >
              Klar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
