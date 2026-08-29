import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { rateLimit, getClientIp } from "../rate-limit";

// Each test uses its own unique key so the module-level bucket map from one
// test can't leak into another.
let keyCounter = 0;
function uniqueKey() {
  keyCounter += 1;
  return `test-key-${keyCounter}`;
}

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows the first request and reports remaining quota", () => {
    const key = uniqueKey();
    const result = rateLimit(key, 3, 60_000);

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("decrements remaining quota on successive calls within the window", () => {
    const key = uniqueKey();
    rateLimit(key, 3, 60_000);
    rateLimit(key, 3, 60_000);
    const third = rateLimit(key, 3, 60_000);

    expect(third.success).toBe(true);
    expect(third.remaining).toBe(0);
  });

  it("rejects requests once the limit is exhausted", () => {
    const key = uniqueKey();
    rateLimit(key, 2, 60_000);
    rateLimit(key, 2, 60_000);
    const third = rateLimit(key, 2, 60_000);

    expect(third.success).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("resets the quota after the window elapses", () => {
    const key = uniqueKey();
    rateLimit(key, 1, 60_000);
    const blocked = rateLimit(key, 1, 60_000);
    expect(blocked.success).toBe(false);

    vi.advanceTimersByTime(60_001);

    const afterReset = rateLimit(key, 1, 60_000);
    expect(afterReset.success).toBe(true);
    expect(afterReset.remaining).toBe(0);
  });

  it("tracks separate buckets independently per key", () => {
    const keyA = uniqueKey();
    const keyB = uniqueKey();

    rateLimit(keyA, 1, 60_000);
    const resultA = rateLimit(keyA, 1, 60_000);
    const resultB = rateLimit(keyB, 1, 60_000);

    expect(resultA.success).toBe(false);
    expect(resultB.success).toBe(true);
  });
});

describe("getClientIp", () => {
  it("uses the first IP from x-forwarded-for when present", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1" },
    });
    expect(getClientIp(request)).toBe("203.0.113.5");
  });

  it("trims whitespace around the first forwarded IP", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "  203.0.113.5  , 10.0.0.1" },
    });
    expect(getClientIp(request)).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const request = new Request("https://example.com", {
      headers: { "x-real-ip": "198.51.100.7" },
    });
    expect(getClientIp(request)).toBe("198.51.100.7");
  });

  it('falls back to "unknown" when no IP headers are present', () => {
    const request = new Request("https://example.com");
    expect(getClientIp(request)).toBe("unknown");
  });
});
