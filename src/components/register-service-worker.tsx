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
 * over, closes that gap — except registration.update() is only as good as
 * the fetch behind it, and browsers are allowed to serve that fetch from
 * their own HTTP cache if sw.js's response headers don't forbid it. Safari
 * in particular has a history of doing exactly that, silently defeating
 * update() (this is the mobile-only variant of the same underlying bug:
 * desktop's HTTP cache happened to be cold, the phone's wasn't).
 * `updateViaCache: "none"` removes that ambiguity — the browser is required
 * to always hit the network for sw.js itself, never its own cache.
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

    navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then((registration) => {
      registration.update().catch(() => {});

      const recheck = () => {
        if (document.visibilityState === "visible") registration.update().catch(() => {});
      };
      document.addEventListener("visibilitychange", recheck);
    }, () => {});
  }, []);

  return null;
}
