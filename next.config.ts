import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Belt-and-suspenders alongside updateViaCache: "none" in
        // register-service-worker.tsx — this stops Vercel's own edge/CDN
        // cache (and any HTTP cache in between) from serving a stale sw.js,
        // not just the browser's local cache that updateViaCache targets.
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
