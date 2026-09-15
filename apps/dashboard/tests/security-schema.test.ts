import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationFiles=["202609140001_initial_schema.sql","202609140002_filter_automatic_opens.sql","202609140003_count_recipient_opens_immediately.sql","202609140004_ignore_first_pixel_request.sql","202609140005_normalize_first_pixel_request.sql"];
const sql=migrationFiles.map(file=>readFileSync(resolve(__dirname,"../../../supabase/migrations",file),"utf8")).join("\n");
const latestSql=readFileSync(resolve(__dirname,"../../../supabase/migrations/202609140004_ignore_first_pixel_request.sql"),"utf8");
describe("database security contract",()=>{
  it("enables RLS on every application table",()=>{for(const table of ["profiles","settings","tracked_emails","open_events","api_rate_limits"])expect(sql).toContain(`alter table public.${table} enable row level security`)});
  it("scopes policies through auth.uid",()=>{expect(sql.match(/auth\.uid\(\)/g)?.length).toBeGreaterThanOrEqual(8);expect(sql).toContain("open_events_select_own")});
  it("keeps the public pixel writer service-role only",()=>{expect(sql).toContain("revoke all on function public.record_open_event");expect(sql).toContain("grant execute on function public.record_open_event(text, text, text) to service_role")});
  it("stores duplicates but does not add them to open_count",()=>{expect(sql).toContain("interval '10 seconds'");expect(sql).toContain("if not duplicate_request then");expect(sql).toContain("open_count = open_count + 1")});
  it("retains but never counts the first pixel request",()=>{expect(latestSql).toContain("when not has_prior_request then 'early_automatic'");expect(latestSql).toContain("select exists(");expect(latestSql).toContain("first request is retained");expect(latestSql).not.toContain("interval '15 seconds'")});
  it("normalizes existing summaries to the first-request heuristic",()=>{const normalization=readFileSync(resolve(__dirname,"../../../supabase/migrations/202609140005_normalize_first_pixel_request.sql"),"utf8");expect(normalization).toContain("distinct on (tracked_email_id)");expect(normalization).toContain("classification = 'early_automatic'");expect(normalization).toContain("open_count = (")});
  it("rate limits event floods per opaque identifier",()=>{expect(sql).toContain("recent_count >= 120");expect(sql).toContain("return 'rate_limited'")});
  it("rate limits authenticated and token APIs through a service-only function",()=>{expect(sql).toContain("consume_api_rate_limit");expect(sql).toContain("grant execute on function public.consume_api_rate_limit(text,text,integer,integer) to service_role")});
});
