// app/manifest.ts
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KKapp",
    short_name: "KKapp",
    description: "Encontrá baños públicos cerca tuyo",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f9fc",
    theme_color: "#4a90e2",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["navigation", "utilities"],
  };
}
