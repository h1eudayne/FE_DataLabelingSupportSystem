import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  css: {
    devSourcemap: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("redux")) return "vendor";
            if (id.includes("bootstrap") || id.includes("reactstrap"))
              return "ui";
            if (id.includes("chart") || id.includes("recharts"))
              return "charts";
            if (id.includes("axios") || id.includes("moment")) return "utils";
          }
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
