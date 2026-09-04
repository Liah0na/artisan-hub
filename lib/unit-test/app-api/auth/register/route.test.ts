import { describe, it, expect, vi, beforeEach } from "vitest";

const findUniqueMock = vi.fn();
const createMock = vi.fn();
const rateLimitMock = vi.fn();
const sendVerificationEmailMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
      create: (...args: unknown[]) => createMock(...args),
    },
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  getClientIp: () => "203.0.113.5",
  rateLimit: (...args: unknown[]) => rateLimitMock(...args),
}));

vi.mock("@/lib/email/send-verification-email", () => ({
  sendVerificationEmail: (...args: unknown[]) => sendVerificationEmailMock(...args),
}));

import { POST } from "@/app/api/auth/register/route";

function makeRequest(body: unknown, headers: Record<string, string> = { origin: "https://x", host: "x" }) {
  return new Request("https://x/api/auth/register", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: "Maria Silva",
    email: "maria@example.com",
    password: "senha1234",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  rateLimitMock.mockReturnValue({ success: true, remaining: 4, resetAt: Date.now() + 60_000 });
});

describe("POST /api/auth/register", () => {
  it("rejects a request from an untrusted origin with 403", async () => {
    const res = await POST(makeRequest(validPayload(), { origin: "https://evil.example.com", host: "x" }));

    expect(res.status).toBe(403);
    expect(rateLimitMock).not.toHaveBeenCalled();
  });

  it("returns 429 when the IP has exceeded the rate limit", async () => {
    rateLimitMock.mockReturnValue({ success: false, remaining: 0, resetAt: Date.now() });

    const res = await POST(makeRequest(validPayload()));

    expect(res.status).toBe(429);
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("returns 400 with the first Zod validation message for invalid input", async () => {
    const res = await POST(makeRequest(validPayload({ email: "not-an-email" })));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it("rejects a filled honeypot field as invalid input (schema requires it empty)", async () => {
    const res = await POST(makeRequest(validPayload({ website: "http://spam.example" })));

    expect(res.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
    expect(sendVerificationEmailMock).not.toHaveBeenCalled();
  });

  it("returns 409 when a user with that email already exists", async () => {
    findUniqueMock.mockResolvedValueOnce({ id: "existing" });

    const res = await POST(makeRequest(validPayload()));

    expect(res.status).toBe(409);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("creates the user, sends the verification email, and returns 201 on success", async () => {
    findUniqueMock.mockResolvedValueOnce(null);
    createMock.mockResolvedValueOnce({
      id: "new-user-id",
      name: "Maria Silva",
      email: "maria@example.com",
      role: "artisan",
    });

    const res = await POST(makeRequest(validPayload()));

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.user).toEqual({
      id: "new-user-id",
      name: "Maria Silva",
      email: "maria@example.com",
      role: "artisan",
    });
    expect(sendVerificationEmailMock).toHaveBeenCalledWith(
      "maria@example.com",
      expect.any(String)
    );

    // password should never be echoed back or hashed with a low cost factor
    const createArgs = createMock.mock.calls[0][0];
    expect(createArgs.data.passwordHash).not.toBe("senha1234");
    expect(createArgs.data.role).toBe("artisan");
    expect(createArgs.data.emailVerified).toBe(false);
  });

  it("returns 500 when an unexpected error occurs", async () => {
    findUniqueMock.mockRejectedValueOnce(new Error("db down"));

    const res = await POST(makeRequest(validPayload()));

    expect(res.status).toBe(500);
  });
});
