import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("@/lib/prisma", async () => (await import("../fake-rate-limit-store")).fakePrismaModule);

import { rows, failNextCreateWithConflict } from "../fake-rate-limit-store";
import {
  rateLimit,
  refundRateLimit,
  resetRateLimit,
  purgeExpiredRateLimits,
  getClientIp,
} from "../../rate-limit";

// Each test uses its own unique key so buckets from one test can't leak into
// another.
let keyCounter = 0;
function uniqueKey() {
  keyCounter += 1;
  return `test-key-${keyCounter}`;
}
uniqueKey.last = () => `test-key-${keyCounter}`;

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows the first request and reports remaining quota", async () => {
    const key = uniqueKey();
    const result = await rateLimit(key, 3, 60_000);

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("decrements remaining quota on successive calls within the window", async () => {
    const key = uniqueKey();
    await rateLimit(key, 3, 60_000);
    await rateLimit(key, 3, 60_000);
    const third = await rateLimit(key, 3, 60_000);

    expect(third.success).toBe(true);
    expect(third.remaining).toBe(0);
  });

  it("rejects requests once the limit is exhausted", async () => {
    const key = uniqueKey();
    await rateLimit(key, 2, 60_000);
    await rateLimit(key, 2, 60_000);
    const third = await rateLimit(key, 2, 60_000);

    expect(third.success).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("resets the quota after the window elapses", async () => {
    const key = uniqueKey();
    await rateLimit(key, 1, 60_000);
    const blocked = await rateLimit(key, 1, 60_000);
    expect(blocked.success).toBe(false);

    vi.advanceTimersByTime(60_001);

    const afterReset = await rateLimit(key, 1, 60_000);
    expect(afterReset.success).toBe(true);
    expect(afterReset.remaining).toBe(0);
  });

  it("tracks separate buckets independently per key", async () => {
    const keyA = uniqueKey();
    const keyB = uniqueKey();

    await rateLimit(keyA, 1, 60_000);
    const resultA = await rateLimit(keyA, 1, 60_000);
    const resultB = await rateLimit(keyB, 1, 60_000);

    expect(resultA.success).toBe(false);
    expect(resultB.success).toBe(true);
  });
});

describe("rateLimit storage", () => {
  it("counts against the existing window when a concurrent request created it first", async () => {
    failNextCreateWithConflict({ count: 2, resetAt: new Date(Date.now() + 60_000) });

    const result = await rateLimit(uniqueKey(), 3, 60_000);

    expect(result).toMatchObject({ success: true, remaining: 0 });
    expect((await rateLimit(uniqueKey.last(), 3, 60_000)).success).toBe(false);
  });

  it("doesn't store the key in plain text", async () => {
    await rateLimit("signup:203.0.113.5", 3, 60_000);

    expect([...rows.keys()].join(" ")).not.toContain("203.0.113.5");
  });

  it("refundRateLimit gives back exactly one request", async () => {
    const key = uniqueKey();
    await rateLimit(key, 1, 60_000);

    await refundRateLimit(key);

    expect((await rateLimit(key, 1, 60_000)).success).toBe(true);
    expect((await rateLimit(key, 1, 60_000)).success).toBe(false);
  });

  it("resetRateLimit clears the quota", async () => {
    const key = uniqueKey();
    await rateLimit(key, 1, 60_000);
    await rateLimit(key, 1, 60_000);

    await resetRateLimit(key);

    expect((await rateLimit(key, 1, 60_000)).success).toBe(true);
  });

  it("purgeExpiredRateLimits removes only closed windows", async () => {
    rows.clear();
    rows.set("old", { id: "old", count: 3, resetAt: new Date(Date.now() - 1000) });
    rows.set("live", { id: "live", count: 3, resetAt: new Date(Date.now() + 1000) });

    expect(await purgeExpiredRateLimits()).toBe(1);
    expect([...rows.keys()]).toEqual(["live"]);
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
