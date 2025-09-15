// frontend/vite.config.js
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
  },
  base: "/static/",                           // Django STATIC_URL
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    manifest: true,                           // generates .vite/manifest.json
    rollupOptions: {
      input: resolve(__dirname, "src/main.js")// your entry
    }
  }
});
