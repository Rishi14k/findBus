import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import {VitePWA} from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "BusTrack Live",
        short_name: "BusTrack",
        description: "Real-time bus tracking for smart commuting",
        theme_color: "#123D87",
        background_color: "#BBE0EF",
        display: "standalone",
        orientation: "portrait",
        id: "/", // Explicitly sets the App ID to match your start URL
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable", // Separated to fix the "discouraged" warning
          },
        ],
        // Adding these will fix the "Richer PWA Install UI" warnings
        // Just ensure you have these files in your public folder
        screenshots: [
          {
            src: "screenshot-mobile.png",
            sizes: "1082x2402", // Replace with actual size of your mobile capture
            type: "image/png",
            form_factor: "narrow", // Clears the Mobile Rich UI warning
            label: "Live Map View",
          },
          {
            src: "screenshot-desktop.png",
            sizes: "2880x1808",
            type: "image/png",
            form_factor: "wide",
            label: "Bus Route Details",
          },
        ],
      },
    }),
  ],
});
