import { describe, it, expect } from "vitest";
import { isTrustedOrigin } from "@/lib/utils/verify-origin";

function makeRequest(headers: Record<string, string>) {
  return new Request("https://app.example.com/api/whatever", {
    method: "POST",
    headers,
  });
}

describe("isTrustedOrigin", () => {
  it("accepts a request whose Origin host matches its Host header", () => {
    const request = makeRequest({ origin: "https://app.example.com", host: "app.example.com" });
    expect(isTrustedOrigin(request)).toBe(true);
  });

  it("rejects a request from a different origin (classic CSRF shape)", () => {
    const request = makeRequest({ origin: "https://evil.example.com", host: "app.example.com" });
    expect(isTrustedOrigin(request)).toBe(false);
  });

  it("rejects a request with no Origin header at all", () => {
    const request = makeRequest({ host: "app.example.com" });
    expect(isTrustedOrigin(request)).toBe(false);
  });

  it("rejects a request with no Host header", () => {
    const request = new Request("https://app.example.com/api/whatever", {
      method: "POST",
      headers: { origin: "https://app.example.com" },
    });
    expect(isTrustedOrigin(request)).toBe(false);
  });

  it("rejects a malformed Origin header instead of throwing", () => {
    const request = makeRequest({ origin: "not-a-url", host: "app.example.com" });
    expect(isTrustedOrigin(request)).toBe(false);
  });

  it("ignores the origin's port/scheme differences beyond host (matches Host header format)", () => {
    // Origin includes the port when non-default; Host header does too when present.
    const request = makeRequest({ origin: "http://localhost:3000", host: "localhost:3000" });
    expect(isTrustedOrigin(request)).toBe(true);
  });
});
