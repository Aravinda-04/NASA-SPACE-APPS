import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "output/stage4-spike/build",
    rollupOptions: { input: "flip-spike.html" },
  },
});
