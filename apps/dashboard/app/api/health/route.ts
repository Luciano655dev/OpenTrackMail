export function GET() { return Response.json({ ok: true, service: "opentrackmail-api" }, { headers: { "Cache-Control": "no-store" } }); }
