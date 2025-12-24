import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Allows the frontend dev server (e.g. :5173) to call the API on :3000
      // without dealing with CORS.
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});