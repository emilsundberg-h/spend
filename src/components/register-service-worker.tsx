"use client";

import { useEffect } from "react";

/** Registers the app-shell service worker so the PWA can be added to the home screen. */
export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
