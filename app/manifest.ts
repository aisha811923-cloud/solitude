import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Solitude — Midnight Sanctuary",
    short_name: "Solitude",
    description: "An intimate, hardware-modeled midnight sad songs sanctuary.",
    start_url: "/",
    display: "standalone",
    background_color: "#070B14",
    theme_color: "#070B14",
    orientation: "any",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
