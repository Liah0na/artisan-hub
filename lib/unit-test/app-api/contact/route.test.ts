import { describe, it, expect, vi, beforeEach } from "vitest";

const createMock = vi.fn();
const rateLimitMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    contactMessage: {
      create: (...args: unknown[]) => createMock(...args),
    },
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  getClientIp: () => "203.0.113.5",
  rateLimit: (...args: unknown[]) => rateLimitMock(...args),
}));

import { POST } from "@/app/api/contact/route";

const TRUSTED_HEADERS = { origin: "https://x", host: "x" };

function makeRequest(body: unknown, headers: Record<string, string> = TRUSTED_HEADERS) {
  return new Request("https://x/api/contact", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  rateLimitMock.mockReturnValue({ success: true, remaining: 4, resetAt: Date.now() + 60_000 });
});

describe("POST /api/contact", () => {
  it("rejects a request from an untrusted origin with 403", async () => {
    const res = await POST(makeRequest({ name: "Maria", email: "a@b.com", message: "hi" }, { origin: "https://evil.example.com", host: "x" }));

    expect(res.status).toBe(403);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns 429 when the IP has exceeded the rate limit", async () => {
    rateLimitMock.mockReturnValue({ success: false, remaining: 0, resetAt: Date.now() });

    const res = await POST(makeRequest({ name: "Maria", email: "a@b.com", message: "hi" }));

    expect(res.status).toBe(429);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("creates a message and returns { ok: true } for a valid payload", async () => {
    createMock.mockResolvedValueOnce({});

    const res = await POST(
      makeRequest({ name: "Maria", email: "maria@example.com", message: "Olá!" })
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(createMock).toHaveBeenCalledWith({
      data: { name: "Maria", email: "maria@example.com", message: "Olá!" },
    });
  });

  it("trims whitespace from name, email, and message before saving", async () => {
    createMock.mockResolvedValueOnce({});

    await POST(
      makeRequest({ name: "  Maria  ", email: "  maria@example.com  ", message: "  Olá!  " })
    );

    expect(createMock).toHaveBeenCalledWith({
      data: { name: "Maria", email: "maria@example.com", message: "Olá!" },
    });
  });

  it("rejects a filled honeypot field silently (as invalid input, no message created)", async () => {
    const res = await POST(
      makeRequest({ name: "Maria", email: "a@b.com", message: "hi", website: "http://spam.example" })
    );

    expect(res.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("rejects an unparseable JSON body with 400", async () => {
    const res = await POST(new Request("https://x/api/contact", { method: "POST", headers: TRUSTED_HEADERS, body: "not json" }));

    expect(res.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("rejects a missing name with 400", async () => {
    const res = await POST(makeRequest({ email: "a@b.com", message: "hi" }));
    expect(res.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("rejects a name longer than 120 characters", async () => {
    const res = await POST(
      makeRequest({ name: "A".repeat(121), email: "a@b.com", message: "hi" })
    );
    expect(res.status).toBe(400);
  });

  it("rejects an invalid email", async () => {
    const res = await POST(makeRequest({ name: "Maria", email: "not-an-email", message: "hi" }));
    expect(res.status).toBe(400);
  });

  it("rejects an empty message", async () => {
    const res = await POST(makeRequest({ name: "Maria", email: "a@b.com", message: "" }));
    expect(res.status).toBe(400);
  });

  it("rejects a message longer than 2000 characters", async () => {
    const res = await POST(
      makeRequest({ name: "Maria", email: "a@b.com", message: "x".repeat(2001) })
    );
    expect(res.status).toBe(400);
  });
});
