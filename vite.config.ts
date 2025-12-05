import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],
  base: './',  // Use relative paths for Tauri

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 4321,
    strictPort: true, // Force Vite to use this port
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 4321,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  
  // Build optimizations for faster startup
  build: {
    target: "esnext",           // Modern browsers only (smaller output)
    minify: "esbuild",          // Fastest minifier
    cssMinify: true,            // Minify CSS
    rollupOptions: {
      output: {
        manualChunks: undefined, // Disable code splitting (single bundle loads faster)
      },
    },
  },
}));
