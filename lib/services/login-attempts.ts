import { rateLimit, refundRateLimit, resetRateLimit } from "@/lib/rate-limit";

// The email limit stops guessing against one account from many IPs; the
// higher IP limit stops one IP from trying a few passwords on many accounts.
export const LOGIN_EMAIL_LIMIT = 10;
export const LOGIN_IP_LIMIT = 50;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

const emailKey = (email: string) => `login:email:${email}`;
const ipKey = (ip: string) => `login:ip:${ip}`;

/**
 * Counts a login attempt before the password is checked, so parallel guesses
 * can't slip through between the check and the count. Returns whether the
 * attempt may proceed. Unknown emails count too, so a lockout doesn't reveal
 * which accounts exist.
 */
export async function consumeLoginAttempt(email: string, ip: string): Promise<boolean> {
  const [emailResult, ipResult] = await Promise.all([
    rateLimit(emailKey(email), LOGIN_EMAIL_LIMIT, LOGIN_WINDOW_MS),
    // Without a known IP every such caller would share one bucket.
    ip === "unknown" ? { success: true } : rateLimit(ipKey(ip), LOGIN_IP_LIMIT, LOGIN_WINDOW_MS),
  ]);

  return emailResult.success && ipResult.success;
}

/**
 * Forgives the attempt after a correct password. The IP bucket only loses this
 * one attempt: clearing it would let an attacker reset their limit by signing
 * in to their own account between guesses.
 */
export async function clearLoginAttempts(email: string, ip: string) {
  await resetRateLimit(emailKey(email));

  if (ip !== "unknown") await refundRateLimit(ipKey(ip));
}
