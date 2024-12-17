import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Selfie App",
        short_name: "Selfie",
        description:
          "A fantastic application for organising your busy uni life",
        theme_color: "#000000",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "/icons/96.png",
            sizes: "96x96",
            type: "image/png",
          },
          {
            src: "/icons/192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      injectRegister: "auto",
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg}"],
      },
      devOptions: {
        enabled: true, // Attiva PWA in sviluppo
        type: "module",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
