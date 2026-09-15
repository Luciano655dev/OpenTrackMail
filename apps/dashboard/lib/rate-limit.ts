import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function consumeRateLimit(key: string, bucket: string, limit: number, windowSeconds: number) {
  const { data, error } = await createAdminClient().rpc("consume_api_rate_limit", {
    p_rate_key: key.slice(0, 128), p_bucket: bucket.slice(0, 40), p_limit: limit, p_window_seconds: windowSeconds,
  });
  if (error) throw new Error(`Rate limit unavailable: ${error.code}`);
  return Boolean(data);
}
