import { defineConfig, loadEnv } from "vite";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.config";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  process.env.OTM_API_URL_FOR_MANIFEST = env.VITE_API_URL || "http://localhost:3001";
  return { plugins: [crx({ manifest })], build: { sourcemap: false, emptyOutDir: true } };
});
