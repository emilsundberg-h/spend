// Minimal app-shell cache so the installed PWA has something to show offline.
// Real data sync will arrive with the Supabase integration — this is intentionally simple.
//
// Bumped to v2: v1 precached "/" and could cache a *redirected* response for
// it (auth middleware sends "/" -> "/login" and back depending on session).
// Serving a redirected response for a navigation is rejected by Safari
// ("Response served by service worker has redirections"), so "/" must never
// be precached or cached, and navigations must not be resolved with a
// response that already followed a redirect.
const CACHE = "utgifter-shell-v2";
const SHELL_URLS = [];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Navigations are auth-gated and can be redirected by middleware on every
  // request. `redirect: "manual"` stops us from following that redirect
  // ourselves (which would produce a Response the browser refuses to accept
  // from a service worker for a navigate request) — instead we hand back the
  // opaque redirect and let the browser perform the actual navigation.
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request, { redirect: "manual" }));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request)
          .then((response) => {
            if (response.redirected) return response;
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
            return response;
          })
          .catch(() => cached),
    ),
  );
});
