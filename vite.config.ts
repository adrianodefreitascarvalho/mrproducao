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
      // Proxy all Supabase API calls to the remote server to avoid CORS issues in development.
      '^/(auth|rest|storage|realtime)/v1': {
        target: 'https://orcfirodhgaxfluhryen.supabase.co',
        changeOrigin: true,
        secure: true,
        ws: true, // Enable websocket proxying for realtime
        logLevel: 'debug', // Add detailed logging to debug proxy issues
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
