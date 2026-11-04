import { describe, it, expect, vi, beforeEach } from "vitest";

const findUniqueMock = vi.fn();
const updateMock = vi.fn();
const rateLimitMock = vi.fn();
const sendVerificationEmailMock = vi.fn();
const generateVerificationTokenMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
      update: (...args: unknown[]) => updateMock(...args),
    },
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  getClientIp: () => "203.0.113.5",
  rateLimit: (...args: unknown[]) => rateLimitMock(...args),
}));

vi.mock("@/lib/tokens", () => ({
  generateVerificationToken: (...args: unknown[]) => generateVerificationTokenMock(...args),
}));

vi.mock("@/lib/email/send-verification-email", () => ({
  sendVerificationEmail: (...args: unknown[]) => sendVerificationEmailMock(...args),
}));

import { POST } from "@/app/api/auth/resend-verification/route";

const GENERIC_BODY = {
  message: "Se existir uma conta com este e-mail e ela ainda não tiver sido confirmada, enviamos um novo link.",
};

function makeRequest(body: unknown) {
  return new Request("https://x/api/auth/resend-verification", {
    method: "POST",
    headers: { origin: "https://x", host: "x" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  rateLimitMock.mockReturnValue({ success: true, remaining: 2, resetAt: Date.now() + 60_000 });
  generateVerificationTokenMock.mockReturnValue({
    token: "raw-token",
    tokenHash: "hashed-token",
    expiresAt: new Date("2026-01-02T00:00:00.000Z"),
  });
});

describe("POST /api/auth/resend-verification", () => {
  it("rejects a request whose Origin doesn't match the Host", async () => {
    const res = await POST(
      new Request("https://x/api/auth/resend-verification", {
        method: "POST",
        headers: { origin: "https://evil.example.com", host: "x" },
        body: JSON.stringify({ email: "maria@example.com" }),
      })
    );

    expect(res.status).toBe(403);
  });

  it("returns 429 when the IP has exceeded the rate limit", async () => {
    rateLimitMock.mockReturnValue({ success: false, remaining: 0, resetAt: Date.now() });

    const res = await POST(makeRequest({ email: "maria@example.com" }));

    expect(res.status).toBe(429);
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("returns the generic message without querying the database when no email is given", async () => {
    const res = await POST(makeRequest({}));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(GENERIC_BODY);
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("returns the same generic message when the account doesn't exist (no enumeration)", async () => {
    findUniqueMock.mockResolvedValueOnce(null);

    const res = await POST(makeRequest({ email: "nobody@example.com" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(GENERIC_BODY);
    expect(sendVerificationEmailMock).not.toHaveBeenCalled();
  });

  it("returns the same generic message and sends nothing when the account is already verified", async () => {
    findUniqueMock.mockResolvedValueOnce({
      id: "u1",
      role: "artisan",
      email: "maria@example.com",
      emailVerified: true,
    });

    const res = await POST(makeRequest({ email: "maria@example.com" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(GENERIC_BODY);
    expect(sendVerificationEmailMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("returns the same generic message and sends nothing for a non-artisan account (admins never verify by email)", async () => {
    findUniqueMock.mockResolvedValueOnce({
      id: "u1",
      role: "admin",
      email: "admin@example.com",
      emailVerified: false,
    });

    const res = await POST(makeRequest({ email: "admin@example.com" }));

    expect(res.status).toBe(200);
    expect(sendVerificationEmailMock).not.toHaveBeenCalled();
  });

  it("regenerates the token and resends the email for an unverified artisan account", async () => {
    findUniqueMock.mockResolvedValueOnce({
      id: "u1",
      role: "artisan",
      email: "maria@example.com",
      emailVerified: false,
    });
    updateMock.mockResolvedValueOnce({});

    const res = await POST(makeRequest({ email: "  Maria@Example.com  " }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(GENERIC_BODY);
    expect(findUniqueMock).toHaveBeenCalledWith({ where: { email: "maria@example.com" } });
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { verificationToken: "hashed-token", verificationTokenExpires: new Date("2026-01-02T00:00:00.000Z") },
    });
    expect(sendVerificationEmailMock).toHaveBeenCalledWith("maria@example.com", "raw-token");
  });
});
