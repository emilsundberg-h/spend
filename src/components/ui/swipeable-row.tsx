"use client";

import { useRef, useState, type MouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const ACTION_WIDTH = 144; // two 72px buttons
const OPEN_THRESHOLD = 48;

/**
 * Wraps a list row (a <Link> or a plain <div>, doesn't matter) so swiping it
 * left reveals "Ändra"/"Ta bort" buttons underneath, iOS Mail-style. Only one
 * row's worth of drag state lives here — each row manages its own open/closed
 * state independently (swiping a second row open doesn't close the first).
 *
 * startX/movedFar/openRef are refs, not state: the very first pointermove
 * after pointerdown can fire before React has committed the state update
 * from pointerdown, so reading state for them intermittently drops the
 * start of the drag (works fine on a slow manual test, silently does
 * nothing on a fast real swipe — confirmed via a real pointer-drag test,
 * not just eyeballing the code).
 */
export function SwipeableRow({
  onEdit,
  onDelete,
  children,
}: {
  onEdit: () => void;
  onDelete: () => void;
  children: ReactNode;
}) {
  const [dragX, setDragX] = useState(0);
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const startX = useRef<number | null>(null);
  const movedFar = useRef(false);
  const openRef = useRef(false);

  function close() {
    setOpen(false);
    openRef.current = false;
    setDragX(0);
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    startX.current = e.clientX;
    movedFar.current = false;
    setDragging(true);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (startX.current === null) return;
    const delta = e.clientX - startX.current;
    if (Math.abs(delta) > 6) movedFar.current = true;
    const base = openRef.current ? -ACTION_WIDTH : 0;
    setDragX(Math.min(0, Math.max(-ACTION_WIDTH, base + delta)));
  }

  function handlePointerUp() {
    setDragging(false);
    startX.current = null;
    setDragX((current) => {
      const shouldOpen = current < -OPEN_THRESHOLD;
      setOpen(shouldOpen);
      openRef.current = shouldOpen;
      return shouldOpen ? -ACTION_WIDTH : 0;
    });
  }

  // A drag ending in a tap-like click still fires a click event afterwards —
  // swallow it so it doesn't also trigger the row's own onClick/navigation.
  // While open, any tap on the row (not the action buttons) just closes it.
  function handleClickCapture(e: MouseEvent) {
    if (movedFar.current) {
      e.preventDefault();
      e.stopPropagation();
      movedFar.current = false;
      return;
    }
    if (open) {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-y-0 right-0 flex overflow-hidden rounded-2xl" style={{ width: ACTION_WIDTH }}>
        <button
          type="button"
          onClick={() => {
            close();
            onEdit();
          }}
          className="flex w-[72px] items-center justify-center bg-chip-bg text-sm font-semibold text-foreground"
        >
          Ändra
        </button>
        <button
          type="button"
          onClick={() => {
            close();
            onDelete();
          }}
          className="flex w-[72px] items-center justify-center bg-red-500 text-sm font-semibold text-white"
        >
          Ta bort
        </button>
      </div>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={handleClickCapture}
        // A <Link> child is a native <a>, which browsers make draggable by
        // default — without this, dragging left on a home-screen row starts
        // a native link-drag instead of delivering pointermove events here,
        // so the row silently never slides (confirmed with a real
        // pointer-drag test, not just eyeballing the code).
        onDragStart={(e) => e.preventDefault()}
        style={{ transform: `translateX(${dragX}px)`, touchAction: "pan-y" }}
        className={cn("relative", !dragging && "transition-transform duration-200 ease-out")}
      >
        {children}
      </div>
    </div>
  );
}
