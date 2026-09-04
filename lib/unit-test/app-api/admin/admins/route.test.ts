import { describe, it, expect, vi, beforeEach } from "vitest";

const getServerSessionMock = vi.fn();
const findUniqueMock = vi.fn();
const createMock = vi.fn();
const bcryptHashMock = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => getServerSessionMock(...args),
}));

vi.mock("@/auth", () => ({ authOptions: {} }));

vi.mock("bcryptjs", () => ({
  default: { hash: (...args: unknown[]) => bcryptHashMock(...args) },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
      create: (...args: unknown[]) => createMock(...args),
    },
  },
}));

import { POST } from "@/app/api/admin/admins/route";

function makeRequest(body: unknown) {
  return new Request("https://x/api/admin/admins", {
    method: "POST",
    headers: { origin: "https://x", host: "x" },
    body: JSON.stringify(body),
  });
}

function validPayload(overrides: Record<string, unknown> = {}) {
  return { name: "Novo Admin", email: "admin2@example.com", password: "senha1234", ...overrides };
}

beforeEach(() => {
  vi.clearAllMocks();
  bcryptHashMock.mockResolvedValue("hashed-password");
});

describe("POST /api/admin/admins", () => {
  it("returns 401 without a session", async () => {
    getServerSessionMock.mockResolvedValueOnce(null);

    const res = await POST(makeRequest(validPayload()));

    expect(res.status).toBe(401);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns 401 for a session that is not superadmin", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "admin" } });

    const res = await POST(makeRequest(validPayload()));

    expect(res.status).toBe(401);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid input", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "superadmin" } });

    const res = await POST(makeRequest(validPayload({ password: "short" })));

    expect(res.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns 409 when the email is already taken", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "superadmin" } });
    findUniqueMock.mockResolvedValueOnce({ id: "existing" });

    const res = await POST(makeRequest(validPayload()));

    expect(res.status).toBe(409);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("creates the admin with role 'admin' and a hashed password", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "superadmin" } });
    findUniqueMock.mockResolvedValueOnce(null);
    createMock.mockResolvedValueOnce({
      id: "new-admin",
      name: "Novo Admin",
      email: "admin2@example.com",
      createdAt: new Date(),
    });

    const res = await POST(makeRequest(validPayload()));

    expect(res.status).toBe(201);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Novo Admin",
          email: "admin2@example.com",
          passwordHash: "hashed-password",
          role: "admin",
        }),
      })
    );
  });
});
