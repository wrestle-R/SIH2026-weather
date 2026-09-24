import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/normalize/route";

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/normalize", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/normalize", () => {
  it("returns a normalized batch for a valid request", async () => {
    const rawBase64 = Buffer.from('{"timestamp":"2026-09-24T00:00:00Z","src_ip":"192.0.2.1"}').toString("base64");
    const response = await POST(request({ rawBase64 }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.events).toHaveLength(1);
    expect(body.events[0].ocsf.src_endpoint.ip).toBe("192.0.2.1");
  });

  it("returns a structured validation error", async () => {
    const response = await POST(request({ format: "unknown" }));
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error.code).toBe("INVALID_REQUEST");
  });

  it("rejects malformed evidence without leaking a stack trace", async () => {
    const response = await POST(request({ rawBase64: Buffer.from("not a supported event").toString("base64") }));
    const body = await response.json();
    expect(response.status).toBe(422);
    expect(body.error.code).toBe("NORMALIZATION_FAILED");
    expect(body.error.message).toMatch(/supported log format/i);
  });

  it("rejects oversized requests before parsing", async () => {
    const response = await POST(request({ rawBase64: "QQ==" }, { "content-length": "1500001" }));
    const body = await response.json();
    expect(response.status).toBe(413);
    expect(body.error.code).toBe("PAYLOAD_TOO_LARGE");
  });
});
