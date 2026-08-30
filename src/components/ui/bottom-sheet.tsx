"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const DISMISS_THRESHOLD = 120;
// Kept in sync with the `duration-300` Tailwind class below — the unmount
// timeout has to match the CSS transition length or the close either snaps
// early (unmounts mid-slide) or leaves a blank gap (unmounts late).
const TRANSITION_MS = 300;

/**
 * A sheet that grows up from the bottom, stops short of the top (never a
 * full-screen takeover), and drags down to dismiss — the drag only starts
 * from the handle bar, not the content below it, so a long scrollable list
 * inside doesn't fight the dismiss gesture.
 *
 * `open` going false doesn't unmount immediately: `visible` lags behind it by
 * TRANSITION_MS so the close plays as a slide-down instead of a hard cut,
 * however it was triggered (backdrop tap, Escape, or a completed drag).
 */
export function BottomSheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const [visible, setVisible] = useState(open);
  const [entered, setEntered] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setDragY(0);
      const frame = requestAnimationFrame(() => setEntered(true));

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      function onKey(e: KeyboardEvent) {
        if (e.key === "Escape") onClose();
      }
      document.addEventListener("keydown", onKey);

      return () => {
        cancelAnimationFrame(frame);
        document.body.style.overflow = previousOverflow;
        document.removeEventListener("keydown", onKey);
      };
    }

    setEntered(false);
    const timeout = setTimeout(() => setVisible(false), TRANSITION_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!visible) return null;

  function handlePointerDown(e: ReactPointerEvent) {
    startY.current = e.clientY;
    setDragging(true);
  }

  function handlePointerMove(e: ReactPointerEvent) {
    if (startY.current === null) return;
    const delta = e.clientY - startY.current;
    setDragY(Math.max(0, delta));
  }

  function handlePointerUp() {
    setDragging(false);
    startY.current = null;
    if (dragY > DISMISS_THRESHOLD) {
      onClose();
    } else {
      setDragY(0);
    }
  }

  const transform = entered ? `translateY(${dragY}px)` : "translateY(100%)";

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Stäng"
        onClick={onClose}
        className={cn("absolute inset-0 bg-black/40 transition-opacity duration-200", entered ? "opacity-100" : "opacity-0")}
      />
      <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-[480px] items-end">
        <div
          style={{ transform, maxHeight: "85vh" }}
          className={cn(
            "pointer-events-auto flex w-full flex-col overflow-hidden rounded-t-3xl bg-background shadow-2xl",
            !dragging && "transition-transform duration-300 ease-out",
          )}
        >
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="flex flex-none touch-none items-center justify-center pb-2 pt-3"
          >
            <div className="h-1.5 w-10 rounded-full bg-chip-bg" />
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
