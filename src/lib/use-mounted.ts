import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/**
 * True once the client has hydrated. Prefer this over `useState` + `useEffect` for the
 * common "avoid SSR/client mismatch" pattern (e.g. reading next-themes' current theme) —
 * useSyncExternalStore forces the one re-render needed without a setState-in-effect.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
