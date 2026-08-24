"use client";

import { useEffect } from "react";

/**
 * Registers the app-shell service worker so the PWA can be added to the home
 * screen — and actively keeps it current. Browsers only check for a new SW
 * version on navigation, and throttle even that to roughly once a day, so an
 * installed PWA left open across a deploy (or just reopened from the home
 * screen icon without a real navigation, which iOS is sluggish about) can
 * keep running a stale worker indefinitely — serving a JS chunk from a build
 * that no longer exists, which shows up as a hard client-side crash. Forcing
 * an update check on load/foreground, and reloading once a new worker takes
 * over, closes that gap.
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });

    navigator.serviceWorker.register("/sw.js").then((registration) => {
      registration.update().catch(() => {});

      const recheck = () => {
        if (document.visibilityState === "visible") registration.update().catch(() => {});
      };
      document.addEventListener("visibilitychange", recheck);
    }, () => {});
  }, []);

  return null;
}
