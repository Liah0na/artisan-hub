/**
 * Minimal in-memory rate limiter, keyed by an arbitrary string (usually IP).
 *
 * Good enough for a single Node.js server instance. It does NOT share state
 * across serverless invocations or multiple instances/regions — if this app
 * is deployed on Vercel or similar, swap this for a shared store such as
 * Upstash Redis (@upstash/ratelimit) so limits are enforced consistently.
 */

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

// Periodically drop expired buckets so this map doesn't grow forever.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * Checks and consumes one request from the given key's quota.
 *
 * @param key unique identifier for the caller (e.g. `signup:<ip>`)
 * @param limit max requests allowed within the window
 * @param windowMs length of the sliding window in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  cleanup(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    success: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Best-effort extraction of the caller's IP from standard proxy headers.
 * Falls back to "unknown" so unrelated callers don't accidentally share
 * a rate-limit bucket.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
