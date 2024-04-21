import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: "esnext",
    rollupOptions: {
      input: {
        index: "src/main.jsx",
        success: "src/main-success.jsx",
        login: "src/main-login.jsx",
      },
    },
  },

  base: "",
  worker: { format: "es" },
});
