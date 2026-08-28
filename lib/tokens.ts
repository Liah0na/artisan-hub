import { randomBytes, createHash } from "crypto";

export const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generates a verification token pair:
 * - `token`: the raw value sent to the user in the email link. Never stored.
 * - `tokenHash`: SHA-256 hash of the token, stored in the database.
 *
 * Storing only the hash means a database leak doesn't expose usable
 * verification links (same principle as never storing passwords in plain text).
 */
export function generateVerificationToken() {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

  return { token, tokenHash, expiresAt };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
