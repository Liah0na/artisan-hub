import { describe, it, expect, vi, beforeEach } from "vitest";

const getServerSessionMock = vi.fn();
const updateMock = vi.fn();
const deleteMock = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => getServerSessionMock(...args),
}));

vi.mock("@/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    contactMessage: {
      update: (...args: unknown[]) => updateMock(...args),
      delete: (...args: unknown[]) => deleteMock(...args),
    },
  },
}));

import { PATCH, DELETE } from "@/app/api/admin/messages/[id]/route";

const MESSAGE_ID = "msg-1";

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makeRequest(body: unknown) {
  return new Request(`https://x/api/admin/messages/${MESSAGE_ID}`, {
    method: "PATCH",
    headers: { origin: "https://x", host: "x" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PATCH /api/admin/messages/[id]", () => {
  it("returns 401 without an admin/superadmin session", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "artisan" } });

    const res = await PATCH(makeRequest({ read: true }), makeParams(MESSAGE_ID));

    expect(res.status).toBe(401);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it.each(["admin", "superadmin"])("allows a session with role %s", async (role) => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role } });
    updateMock.mockResolvedValueOnce({ id: MESSAGE_ID, read: true });

    const res = await PATCH(makeRequest({ read: true }), makeParams(MESSAGE_ID));

    expect(res.status).toBe(200);
  });

  it("defaults 'read' to true when not provided in the body", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "admin" } });
    updateMock.mockResolvedValueOnce({ id: MESSAGE_ID, read: true });

    await PATCH(makeRequest({}), makeParams(MESSAGE_ID));

    expect(updateMock).toHaveBeenCalledWith({
      where: { id: MESSAGE_ID },
      data: { read: true },
    });
  });

  it("returns 404 when the message does not exist", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "admin" } });
    updateMock.mockRejectedValueOnce(new Error("not found"));

    const res = await PATCH(makeRequest({ read: false }), makeParams(MESSAGE_ID));

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/admin/messages/[id]", () => {
  it("returns 401 without an admin/superadmin session", async () => {
    getServerSessionMock.mockResolvedValueOnce(null);

    const res = await DELETE(new Request("https://x", { method: "DELETE", headers: { origin: "https://x", host: "x" } }), makeParams(MESSAGE_ID));

    expect(res.status).toBe(401);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("deletes the message and returns ok:true even if it was already gone", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "superadmin" } });
    deleteMock.mockRejectedValueOnce(new Error("not found"));

    const res = await DELETE(new Request("https://x", { method: "DELETE", headers: { origin: "https://x", host: "x" } }), makeParams(MESSAGE_ID));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});
