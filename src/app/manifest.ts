import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Utgifter",
    short_name: "Utgifter",
    description: "Logga era gemensamma köp tillsammans, direkt när ni handlat.",
    start_url: "/",
    display: "standalone",
    background_color: "#292d33",
    theme_color: "#292d33",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
