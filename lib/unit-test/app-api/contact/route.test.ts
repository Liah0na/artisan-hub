import { describe, it, expect, vi, beforeEach } from "vitest";

const createMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    contactMessage: {
      create: (...args: unknown[]) => createMock(...args),
    },
  },
}));

import { POST } from "@/app/api/contact/route";

function makeRequest(body: unknown) {
  return new Request("https://x/api/contact", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/contact", () => {
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

  it("rejects an unparseable JSON body with 400", async () => {
    const res = await POST(new Request("https://x/api/contact", { method: "POST", body: "not json" }));

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
