"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useExpenses } from "@/lib/expenses-context";

/** px of downward drag (after resistance) needed before a release triggers a refresh. */
const THRESHOLD = 64;
/** Visual cap on how far the indicator can be pulled down. */
const MAX_PULL = 96;
/** Drag feels "heavier" than a 1:1 finger-follow, like the native gesture. */
const RESISTANCE = 0.5;

/**
 * Manual pull-to-refresh for the installed PWA. `display: "standalone"` (see
 * manifest.ts) drops the browser chrome that normally provides this gesture,
 * so there's nothing left to trigger a refetch after the initial load other
 * than the realtime subscription (which only covers inserts made while the
 * page is open) — hence this.
 *
 * Pushes content down with normal layout (padding-top on a spacer), not a
 * CSS transform: a transform on an ancestor creates a new containing block
 * for `position: fixed` descendants (e.g. the "+" button on the home page),
 * which would otherwise drag those along with the pull.
 */
export function PullToRefresh({ children }: { children: ReactNode }) {
  const { refresh } = useExpenses();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const pullDistance = useRef(0);
  const refreshingRef = useRef(false);

  useEffect(() => {
    const atTop = () => window.scrollY <= 0;

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length !== 1 || refreshingRef.current || !atTop()) {
        startY.current = null;
        return;
      }
      startY.current = e.touches[0].clientY;
    }

    function onTouchMove(e: TouchEvent) {
      if (startY.current === null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta <= 0 || !atTop()) {
        // Not a downward pull from the top (anymore) — hand back to normal scrolling.
        startY.current = null;
        pullDistance.current = 0;
        setPull(0);
        return;
      }
      e.preventDefault();
      const next = Math.min(MAX_PULL, delta * RESISTANCE);
      pullDistance.current = next;
      setPull(next);
    }

    async function onTouchEnd() {
      if (startY.current === null) return;
      startY.current = null;
      const distance = pullDistance.current;
      pullDistance.current = 0;

      if (distance < THRESHOLD) {
        setPull(0);
        return;
      }

      refreshingRef.current = true;
      setRefreshing(true);
      setPull(THRESHOLD * 0.75);
      try {
        await refresh();
      } finally {
        refreshingRef.current = false;
        setRefreshing(false);
        setPull(0);
      }
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [refresh]);

  return (
    <>
      <div
        className="flex justify-center overflow-hidden"
        style={{ height: pull, transition: refreshing ? undefined : "height 200ms ease-out" }}
        aria-hidden
      >
        <span
          className={`mt-4 h-5 w-5 flex-none rounded-full border-2 border-border border-t-accent ${
            refreshing ? "animate-spin" : ""
          }`}
          style={{
            opacity: Math.min(1, pull / THRESHOLD),
            transform: refreshing ? undefined : `rotate(${(pull / THRESHOLD) * 360}deg)`,
          }}
        />
      </div>
      {children}
    </>
  );
}
