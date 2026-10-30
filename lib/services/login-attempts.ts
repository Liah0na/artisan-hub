import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";

// Stored in the database rather than lib/rate-limit.ts: that limiter is per
// serverless instance, which an attacker could outrun by spreading guesses
// across instances on Vercel.
//
// The email limit stops guessing against one account from many IPs; the
// higher IP limit stops one IP from trying a few passwords on many accounts.
export const LOGIN_EMAIL_LIMIT = 10;
export const LOGIN_IP_LIMIT = 50;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

// Keys are hashed so this collection doesn't hold emails or IPs, nor whatever
// else people type into the email field by mistake.
function emailKey(email: string) {
  return hashToken(`login:email:${email}`);
}

function ipKey(ip: string) {
  return hashToken(`login:ip:${ip}`);
}

function isUniqueConflict(error: unknown) {
  return (error as { code?: string } | null)?.code === "P2002";
}

async function incrementIfActive(id: string, now: Date) {
  const { count } = await prisma.loginAttempt.updateMany({
    where: { id, resetAt: { gt: now } },
    data: { count: { increment: 1 } },
  });
  return count > 0;
}

// Returns the number of attempts in the current window, this one included.
async function consume(id: string): Promise<number> {
  const now = new Date();

  if (!(await incrementIfActive(id, now))) {
    await prisma.loginAttempt.deleteMany({ where: { id, resetAt: { lte: now } } });

    try {
      await prisma.loginAttempt.create({
        data: { id, count: 1, resetAt: new Date(now.getTime() + LOGIN_WINDOW_MS) },
      });
      return 1;
    } catch (error) {
      // A concurrent attempt opened the window first, so count against it.
      if (!isUniqueConflict(error)) throw error;
      await incrementIfActive(id, now);
    }
  }

  const attempt = await prisma.loginAttempt.findUnique({ where: { id } });
  return attempt?.count ?? 1;
}

/**
 * Counts a login attempt before the password is checked, so parallel guesses
 * can't slip through between the check and the count. Returns whether the
 * attempt may proceed. Unknown emails count too, so a lockout doesn't reveal
 * which accounts exist.
 */
export async function consumeLoginAttempt(email: string, ip: string): Promise<boolean> {
  const [emailAttempts, ipAttempts] = await Promise.all([
    consume(emailKey(email)),
    // Without a known IP every such caller would share one bucket.
    ip === "unknown" ? 0 : consume(ipKey(ip)),
  ]);

  return emailAttempts <= LOGIN_EMAIL_LIMIT && ipAttempts <= LOGIN_IP_LIMIT;
}

/**
 * Forgives the attempt after a correct password. The IP bucket only loses this
 * one attempt: clearing it would let an attacker reset their limit by signing
 * in to their own account between guesses.
 */
export async function clearLoginAttempts(email: string, ip: string) {
  await prisma.loginAttempt.deleteMany({ where: { id: emailKey(email) } });

  if (ip !== "unknown") {
    await prisma.loginAttempt.updateMany({
      where: { id: ipKey(ip), count: { gt: 0 } },
      data: { count: { decrement: 1 } },
    });
  }
}

export async function purgeExpiredLoginAttempts() {
  const { count } = await prisma.loginAttempt.deleteMany({
    where: { resetAt: { lte: new Date() } },
  });
  return count;
}
