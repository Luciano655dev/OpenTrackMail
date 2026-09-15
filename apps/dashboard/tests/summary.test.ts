import { describe, expect, it } from "vitest";
import { summarizeEmail } from "../lib/serialize";

const base = { id:"e1",tracking_id:"a".repeat(32),provider:"gmail" as const,provider_message_id:null,provider_thread_id:null,subject:"Hello",recipients:["person@example.com"],sent_at:"2026-09-14T16:00:00.000Z" };
describe("email status summaries",()=>{
  it("uses persisted non-duplicate summary fields",()=>{const result=summarizeEmail({...base,open_count:2,first_opened_at:"2026-09-14T16:01:00.000Z",last_opened_at:"2026-09-14T16:05:00.000Z"});expect(result.status).toBe("opened");expect(result.openCount).toBe(2)});
  it("ignores rapid duplicates when summarizing raw events",()=>{const result=summarizeEmail({...base,open_events:[{id:"1",detected_at:"2026-09-14T16:01:00.000Z",is_duplicate:false},{id:"2",detected_at:"2026-09-14T16:01:04.000Z",is_duplicate:true}]});expect(result.openCount).toBe(1);expect(result.lastOpenedAt).toBe("2026-09-14T16:01:00.000Z")});
});
