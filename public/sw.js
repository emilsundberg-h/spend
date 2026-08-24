// Minimal app-shell cache so the installed PWA has something to show offline.
// Real data sync will arrive with the Supabase integration — this is intentionally simple.
//
// Bumped to v3: v2 (and v1 before it) cached *every* GET the page made,
// including cross-origin Supabase REST calls (listExpenses etc). A fetch
// handler intercepts those regardless of destination origin, so once the
// expenses list was cached it was served stale forever — newly added
// purchases never showed up until the cache was cleared by hand. Only
// same-origin (static asset) requests may be cached now; everything else
// always hits the network untouched.
//
// v2 -> v1 note (still relevant): "/" must never be precached or cached —
// auth middleware redirects it to/from "/login" depending on session, and a
// service worker handing back an already-redirected response for a
// navigation is rejected by Safari ("Response served by service worker has
// redirections").
const CACHE = "utgifter-shell-v3";
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

  // Only same-origin requests (our own static assets/pages) go through the
  // cache. Cross-origin requests — Supabase REST/auth/realtime calls above
  // all — must always be live: caching a GET here would silently serve
  // stale data (e.g. an expenses list missing anything added since the
  // first fetch) with no error to signal it.
  if (new URL(event.request.url).origin !== self.location.origin) return;

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
