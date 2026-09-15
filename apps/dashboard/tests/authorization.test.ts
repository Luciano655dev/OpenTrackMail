import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { authenticateApiRequest } from "../lib/api";

describe("API authorization",()=>{
  it("rejects requests without a bearer token",async()=>{const result=await authenticateApiRequest(new NextRequest("http://localhost/api/v1/recent"));expect("response" in result).toBe(true);if("response" in result)expect(result.response.status).toBe(401)});
});
