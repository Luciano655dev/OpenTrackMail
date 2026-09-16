import { z } from "zod";

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
});

export function publicEnv() {
  return publicSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

export function serverEnv() {
  const parsed = publicSchema.extend({
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
    EVENT_HASH_SECRET: z.string().min(32),
    TRACKING_PIXEL_ORIGIN: z.url().refine((value) => {
      const url = new URL(value);
      return url.protocol === "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    }, "Tracking pixel origin must be public HTTPS"),
  }).safeParse(process.env);
  if (!parsed.success) throw new Error("Missing or invalid OpenTrackMail server environment variables");
  return parsed.data;
}
