import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// cors per il server di svilupo è attivato di default
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
