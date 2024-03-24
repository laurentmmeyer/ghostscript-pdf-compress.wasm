import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: { target: "esnext" },
  base: "/ghostscript-pdf-compress.wasm/",
});
