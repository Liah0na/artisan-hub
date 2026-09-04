import { describe, it, expect, vi, beforeEach } from "vitest";

const getServerSessionMock = vi.fn();
const findUniqueMock = vi.fn();
const updateMock = vi.fn();
const deleteMock = vi.fn();
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
      update: (...args: unknown[]) => updateMock(...args),
      delete: (...args: unknown[]) => deleteMock(...args),
    },
  },
}));

import { PATCH, DELETE } from "@/app/api/admin/admins/[id]/route";

const TARGET_ID = "admin-1";

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makeRequest(body: unknown) {
  return new Request(`https://x/api/admin/admins/${TARGET_ID}`, {
    method: "PATCH",
    headers: { origin: "https://x", host: "x" },
    body: JSON.stringify(body),
  });
}

function validPayload(overrides: Record<string, unknown> = {}) {
  return { name: "Admin Editado", email: "edited@example.com", ...overrides };
}

beforeEach(() => {
  vi.clearAllMocks();
  bcryptHashMock.mockResolvedValue("hashed-password");
});

describe("PATCH /api/admin/admins/[id]", () => {
  it("returns 401 without a superadmin session", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "admin" } });

    const res = await PATCH(makeRequest(validPayload()), makeParams(TARGET_ID));

    expect(res.status).toBe(401);
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("returns 403 when the target user is not a plain admin (e.g. an artisan)", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "superadmin" } });
    findUniqueMock.mockResolvedValueOnce({ id: TARGET_ID, role: "artisan", email: "a@b.com" });

    const res = await PATCH(makeRequest(validPayload()), makeParams(TARGET_ID));

    expect(res.status).toBe(403);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("returns 403 when the target user does not exist", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "superadmin" } });
    findUniqueMock.mockResolvedValueOnce(null);

    const res = await PATCH(makeRequest(validPayload()), makeParams(TARGET_ID));

    expect(res.status).toBe(403);
  });

  it("returns 400 when name or email is missing", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "superadmin" } });
    findUniqueMock.mockResolvedValueOnce({ id: TARGET_ID, role: "admin", email: "a@b.com" });

    const res = await PATCH(makeRequest({ name: "", email: "" }), makeParams(TARGET_ID));

    expect(res.status).toBe(400);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("returns 400 when a new password shorter than 8 characters is given", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "superadmin" } });
    findUniqueMock.mockResolvedValueOnce({ id: TARGET_ID, role: "admin", email: "a@b.com" });

    const res = await PATCH(
      makeRequest(validPayload({ password: "short" })),
      makeParams(TARGET_ID)
    );

    expect(res.status).toBe(400);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("returns 409 when changing to an email already used by someone else", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "superadmin" } });
    findUniqueMock
      .mockResolvedValueOnce({ id: TARGET_ID, role: "admin", email: "old@example.com" })
      .mockResolvedValueOnce({ id: "someone-else" });

    const res = await PATCH(makeRequest(validPayload()), makeParams(TARGET_ID));

    expect(res.status).toBe(409);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("updates name/email without touching the password when none is given", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "superadmin" } });
    findUniqueMock.mockResolvedValueOnce({
      id: TARGET_ID,
      role: "admin",
      email: "edited@example.com",
    });
    updateMock.mockResolvedValueOnce({ id: TARGET_ID, ...validPayload() });

    const res = await PATCH(makeRequest(validPayload()), makeParams(TARGET_ID));

    expect(res.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: TARGET_ID },
      data: { name: "Admin Editado", email: "edited@example.com" },
      select: expect.any(Object),
    });
    expect(bcryptHashMock).not.toHaveBeenCalled();
  });

  it("hashes and includes the password when a new one is provided", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "superadmin" } });
    findUniqueMock.mockResolvedValueOnce({
      id: TARGET_ID,
      role: "admin",
      email: "edited@example.com",
    });
    updateMock.mockResolvedValueOnce({ id: TARGET_ID });

    await PATCH(makeRequest(validPayload({ password: "novaSenha123" })), makeParams(TARGET_ID));

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ passwordHash: "hashed-password" }),
      })
    );
  });
});

describe("DELETE /api/admin/admins/[id]", () => {
  it("returns 401 without a superadmin session", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "admin" } });

    const res = await DELETE(new Request("https://x", { method: "DELETE", headers: { origin: "https://x", host: "x" } }), makeParams(TARGET_ID));

    expect(res.status).toBe(401);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("returns 403 when the target is not a plain admin", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "superadmin" } });
    findUniqueMock.mockResolvedValueOnce({ id: TARGET_ID, role: "superadmin" });

    const res = await DELETE(new Request("https://x", { method: "DELETE", headers: { origin: "https://x", host: "x" } }), makeParams(TARGET_ID));

    expect(res.status).toBe(403);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("deletes the admin on success", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "superadmin" } });
    findUniqueMock.mockResolvedValueOnce({ id: TARGET_ID, role: "admin" });
    deleteMock.mockResolvedValueOnce({});

    const res = await DELETE(new Request("https://x", { method: "DELETE", headers: { origin: "https://x", host: "x" } }), makeParams(TARGET_ID));

    expect(res.status).toBe(200);
    expect(deleteMock).toHaveBeenCalledWith({ where: { id: TARGET_ID } });
  });
});
