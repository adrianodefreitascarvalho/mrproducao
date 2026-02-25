import { defineConfig, type ConfigEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => ({
  server: {
    host: "::",
    port: 8082,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/rest/v1': {
        target: 'https://mrproducao.lovable.app',
        changeOrigin: true,
        secure: true,
      },
      '/auth/v1': {
        target: 'https://mrproducao.lovable.app',
        changeOrigin: true,
        secure: true,
      },
      '/storage/v1': {
        target: 'https://mrproducao.lovable.app',
        changeOrigin: true,
        secure: true,
      },
      '/realtime/v1': {
        target: 'https://mrproducao.lovable.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
