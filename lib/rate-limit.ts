/**
 * Rate limiter backed by the database, keyed by an arbitrary string (usually
 * IP). Counters live in MongoDB rather than in memory because on Vercel each
 * serverless instance has its own memory: an in-memory limit is reset on
 * every cold start and multiplied by the number of instances running.
 *
 * Windows are fixed: the first hit opens a window of `windowMs`, and every
 * hit until it closes counts against `limit`.
 */

import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";

type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
};

// Keys are hashed so the collection doesn't hold the IPs or emails they're
// built from.
function bucketId(key: string) {
  return hashToken(key);
}

function isUniqueConflict(error: unknown) {
  return (error as { code?: string } | null)?.code === "P2002";
}

async function incrementIfActive(id: string, now: Date) {
  const { count } = await prisma.rateLimitBucket.updateMany({
    where: { id, resetAt: { gt: now } },
    data: { count: { increment: 1 } },
  });
  return count > 0;
}

// Counts one hit and returns the bucket as it stands afterwards. The
// increment is a single atomic update, so concurrent hits are never lost.
async function hit(id: string, windowMs: number) {
  const now = new Date();

  if (!(await incrementIfActive(id, now))) {
    await prisma.rateLimitBucket.deleteMany({ where: { id, resetAt: { lte: now } } });

    const fresh = { count: 1, resetAt: new Date(now.getTime() + windowMs) };
    try {
      await prisma.rateLimitBucket.create({ data: { id, ...fresh } });
      return fresh;
    } catch (error) {
      // A concurrent hit opened the window first, so count against it.
      if (!isUniqueConflict(error)) throw error;
      await incrementIfActive(id, now);
    }
  }

  const bucket = await prisma.rateLimitBucket.findUnique({ where: { id } });
  return bucket ?? { count: 1, resetAt: new Date(now.getTime() + windowMs) };
}

/**
 * Checks and consumes one request from the given key's quota.
 *
 * @param key unique identifier for the caller (e.g. `signup:<ip>`)
 * @param limit max requests allowed within the window
 * @param windowMs length of the window in milliseconds
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const { count, resetAt } = await hit(bucketId(key), windowMs);

  return {
    success: count <= limit,
    remaining: Math.max(limit - count, 0),
    resetAt: resetAt.getTime(),
  };
}

/** Gives back one previously consumed request. */
export async function refundRateLimit(key: string) {
  await prisma.rateLimitBucket.updateMany({
    where: { id: bucketId(key), count: { gt: 0 } },
    data: { count: { decrement: 1 } },
  });
}

/** Clears the key's quota entirely. */
export async function resetRateLimit(key: string) {
  await prisma.rateLimitBucket.deleteMany({ where: { id: bucketId(key) } });
}

/** Deletes buckets whose window has closed. Run daily by the cron job. */
export async function purgeExpiredRateLimits() {
  const { count } = await prisma.rateLimitBucket.deleteMany({
    where: { resetAt: { lte: new Date() } },
  });
  return count;
}

/**
 * Best-effort extraction of the caller's IP from standard proxy headers.
 * Falls back to "unknown", which callers share as one bucket.
 */
export function getClientIp(request: Pick<Request, "headers">): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
