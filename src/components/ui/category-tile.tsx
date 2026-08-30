"use client";

import Link from "next/link";
import { useRef, useState, type MouseEvent } from "react";

const LONG_PRESS_MS = 500;

/**
 * A category tile that opens the amount screen on a normal tap, but reveals
 * a small delete "✕" over itself after a ~500ms press-and-hold — tapping
 * that asks to confirm, tapping anywhere else on the tile dismisses it.
 * Deleting reassigns that category's existing purchases to "Övrigt" (see
 * useExpenses().hideCategory) — this component just triggers it.
 */
export function CategoryTile({ label, href, onDelete }: { label: string; href: string; onDelete: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef<number | null>(null);
  const longPressed = useRef(false);

  function startPress() {
    longPressed.current = false;
    timerRef.current = window.setTimeout(() => {
      longPressed.current = true;
      setConfirming(true);
    }, LONG_PRESS_MS);
  }

  function cancelPress() {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  // A long press ending under the finger still fires a click afterwards on
  // touch devices — swallow it here so it doesn't also navigate.
  function handleClickCapture(e: MouseEvent) {
    if (longPressed.current) {
      e.preventDefault();
      e.stopPropagation();
      longPressed.current = false;
    }
  }

  function handleConfirmDelete() {
    setConfirming(false);
    if (window.confirm(`Ta bort kategorin "${label}"? Köp som redan har den flyttas till Övrigt.`)) {
      onDelete();
    }
  }

  return (
    <div className="relative">
      <Link
        href={href}
        onPointerDown={startPress}
        onPointerUp={cancelPress}
        onPointerLeave={cancelPress}
        onPointerCancel={cancelPress}
        onClickCapture={handleClickCapture}
        onDragStart={(e) => e.preventDefault()}
        className="flex h-[92px] items-end rounded-[20px] bg-surface p-3.5 text-left text-base font-semibold leading-tight text-foreground transition-transform active:scale-[0.98]"
      >
        {label}
      </Link>

      {confirming ? (
        <div className="absolute inset-0 rounded-[20px] bg-background/95">
          <button type="button" onClick={() => setConfirming(false)} aria-label="Avbryt" className="absolute inset-0" />
          <button
            type="button"
            onClick={handleConfirmDelete}
            aria-label={`Ta bort ${label}`}
            className="absolute inset-0 m-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-lg font-bold text-white"
          >
            ✕
          </button>
        </div>
      ) : null}
    </div>
  );
}
