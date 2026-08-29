import { describe, it, expect } from "vitest";
import {
  generateVerificationToken,
  hashToken,
  VERIFICATION_TOKEN_TTL_MS,
} from "../../tokens";

describe("hashToken", () => {
  it("is deterministic for the same input", () => {
    expect(hashToken("abc123")).toBe(hashToken("abc123"));
  });

  it("produces different hashes for different inputs", () => {
    expect(hashToken("abc123")).not.toBe(hashToken("abc124"));
  });

  it("returns a 64-character lowercase hex string (SHA-256)", () => {
    const hash = hashToken("anything");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("generateVerificationToken", () => {
  it("returns a token, its matching hash, and an expiry date", () => {
    const { token, tokenHash, expiresAt } = generateVerificationToken();

    expect(token).toMatch(/^[a-f0-9]{64}$/); // 32 random bytes -> 64 hex chars
    expect(tokenHash).toBe(hashToken(token));
    expect(expiresAt).toBeInstanceOf(Date);
  });

  it("sets the expiry roughly TTL ms in the future", () => {
    const before = Date.now();
    const { expiresAt } = generateVerificationToken();
    const after = Date.now();

    expect(expiresAt.getTime()).toBeGreaterThanOrEqual(
      before + VERIFICATION_TOKEN_TTL_MS
    );
    expect(expiresAt.getTime()).toBeLessThanOrEqual(
      after + VERIFICATION_TOKEN_TTL_MS
    );
  });

  it("never returns the raw token as the stored hash", () => {
    const { token, tokenHash } = generateVerificationToken();
    expect(tokenHash).not.toBe(token);
  });

  it("generates a different token on every call", () => {
    const a = generateVerificationToken();
    const b = generateVerificationToken();
    expect(a.token).not.toBe(b.token);
  });
});
