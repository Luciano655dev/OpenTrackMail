import { defineConfig, loadEnv } from "vite";
import { crx } from "@crxjs/vite-plugin";
import { readFileSync } from "node:fs";
import manifest from "./manifest.config";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  if (mode === "production") {
    for (const line of readFileSync(new URL("./.env.production", import.meta.url), "utf8").split(/\r?\n/)) {
      const match = line.match(/^(VITE_[A-Z_]+)=(.*)$/);
      if (match) {
        env[match[1]!] = match[2]!;
        process.env[match[1]!] = match[2]!;
      }
    }
  }
  for (const key of ["VITE_API_URL", "VITE_PIXEL_ORIGIN", "VITE_APP_URL", "VITE_SUPABASE_URL"] as const) {
    if (!env[key]) throw new Error(`${key} is required for the ${mode} extension build`);
    new URL(env[key]);
  }
  const api = new URL(env.VITE_API_URL!);
  const pixel = new URL(env.VITE_PIXEL_ORIGIN!);
  if (pixel.protocol !== "https:" || ["localhost", "127.0.0.1", "[::1]"].includes(pixel.hostname)) throw new Error("VITE_PIXEL_ORIGIN must be public HTTPS");
  if (api.protocol !== "https:" && !(mode === "development" && api.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(api.hostname))) throw new Error("VITE_API_URL must be HTTPS outside local development");
  process.env.OTM_API_URL_FOR_MANIFEST = env.VITE_API_URL;
  process.env.OTM_PIXEL_ORIGIN_FOR_MANIFEST = env.VITE_PIXEL_ORIGIN;
  return { plugins: [crx({ manifest })], build: { sourcemap: false, emptyOutDir: true } };
});
