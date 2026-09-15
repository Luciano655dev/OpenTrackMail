import { after, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";
import { etagForTrackingId, isValidTrackingId, normalizeUserAgent, sourceHash, TRANSPARENT_GIF } from "@/lib/tracking";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest, context: { params: Promise<{ trackingId: string }> }) {
  const { trackingId } = await context.params;
  const response = new Response(TRANSPARENT_GIF, { status: 200, headers: pixelHeaders(isValidTrackingId(trackingId) ? etagForTrackingId(trackingId) : undefined) });
  if (!isValidTrackingId(trackingId)) return response;
  const env = serverEnv();
  const userAgent = normalizeUserAgent(request.headers.get("user-agent"));
  const fingerprint = sourceHash(request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"), userAgent, env.EVENT_HASH_SECRET);
  after(async () => {
    // A 10-second duplicate window prevents mail proxies from inflating the useful count.
    // Every accepted request is still stored so this heuristic can be tuned later.
    const { error } = await createAdminClient().rpc("record_open_event", { p_tracking_id: trackingId, p_user_agent: userAgent, p_source_hash: fingerprint });
    if (error) console.error("OpenTrackMail event write failed", { code: error.code });
  });
  return response;
}

function pixelHeaders(etag?: string) {
  return { "Content-Type": "image/gif", "Content-Length": String(TRANSPARENT_GIF.length), "Cache-Control": "no-store, no-cache, must-revalidate, private", Pragma: "no-cache", Expires: "0", "X-Content-Type-Options": "nosniff", ...(etag ? { ETag: etag } : {}) };
}
