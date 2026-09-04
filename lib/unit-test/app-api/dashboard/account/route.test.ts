import { describe, it, expect, vi, beforeEach } from "vitest";

const getServerSessionMock = vi.fn();
const findUniqueMock = vi.fn();
const findManyMock = vi.fn();
const deleteManyMock = vi.fn();
const deleteMock = vi.fn();
const bcryptCompareMock = vi.fn();
const deleteCloudinaryAssetsMock = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => getServerSessionMock(...args),
}));

vi.mock("@/lib/utils/auth", () => ({ authOptions: {} }));

vi.mock("bcryptjs", () => ({
  default: { compare: (...args: unknown[]) => bcryptCompareMock(...args) },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
      delete: (...args: unknown[]) => deleteMock(...args),
    },
    product: {
      findMany: (...args: unknown[]) => findManyMock(...args),
      deleteMany: (...args: unknown[]) => deleteManyMock(...args),
    },
  },
}));

vi.mock("@/lib/utils/cloudinary.server", () => ({
  deleteCloudinaryAssets: (...args: unknown[]) => deleteCloudinaryAssetsMock(...args),
}));

import { DELETE } from "@/app/api/dashboard/account/route";

const USER_ID = "u1";

function makeRequest(body: unknown) {
  return new Request("https://x/api/dashboard/account", {
    method: "DELETE",
    headers: { origin: "https://x", host: "x", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  findManyMock.mockResolvedValue([]);
});

describe("DELETE /api/dashboard/account", () => {
  it("rejects a request whose Origin doesn't match the Host (item #15)", async () => {
    const res = await DELETE(
      new Request("https://x/api/dashboard/account", {
        method: "DELETE",
        headers: { origin: "https://evil.example.com", host: "x" },
        body: JSON.stringify({ password: "whatever" }),
      })
    );

    expect(res.status).toBe(403);
    expect(getServerSessionMock).not.toHaveBeenCalled();
  });

  it("returns 401 without a session", async () => {
    getServerSessionMock.mockResolvedValueOnce(null);

    const res = await DELETE(makeRequest({ password: "senha1234" }));

    expect(res.status).toBe(401);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("refuses to delete a superadmin account, regardless of password", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: USER_ID, role: "superadmin" } });

    const res = await DELETE(makeRequest({ password: "senha1234" }));

    expect(res.status).toBe(403);
    expect(findUniqueMock).not.toHaveBeenCalled();
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("returns 400 when no password is provided", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: USER_ID, role: "artisan" } });

    const res = await DELETE(makeRequest({}));

    expect(res.status).toBe(400);
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("returns 401 when the password doesn't match", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: USER_ID, role: "artisan" } });
    findUniqueMock.mockResolvedValueOnce({ id: USER_ID, passwordHash: "hashed", avatar: null });
    bcryptCompareMock.mockResolvedValueOnce(false);

    const res = await DELETE(makeRequest({ password: "wrong" }));

    expect(res.status).toBe(401);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("deletes the user's products, the user, and every referenced Cloudinary asset (avatar + product images)", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: USER_ID, role: "artisan" } });
    findUniqueMock.mockResolvedValueOnce({
      id: USER_ID,
      passwordHash: "hashed",
      avatar: { url: "https://cdn/avatar.jpg", publicId: `artisan-hub/avatars/${USER_ID}/a` },
    });
    bcryptCompareMock.mockResolvedValueOnce(true);
    findManyMock.mockResolvedValueOnce([
      { images: [{ url: "https://cdn/p1.jpg", publicId: `artisan-hub/products/${USER_ID}/p1` }] },
      { images: [{ url: "https://cdn/p2.jpg", publicId: `artisan-hub/products/${USER_ID}/p2` }] },
    ]);

    const res = await DELETE(makeRequest({ password: "senha1234" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    expect(deleteManyMock).toHaveBeenCalledWith({ where: { artisanId: USER_ID } });
    expect(deleteMock).toHaveBeenCalledWith({ where: { id: USER_ID } });

    // DB deletes must happen before the Cloudinary cleanup call.
    expect(deleteManyMock.mock.invocationCallOrder[0]).toBeLessThan(
      deleteCloudinaryAssetsMock.mock.invocationCallOrder[0]
    );

    expect(deleteCloudinaryAssetsMock).toHaveBeenCalledWith([
      `artisan-hub/avatars/${USER_ID}/a`,
      `artisan-hub/products/${USER_ID}/p1`,
      `artisan-hub/products/${USER_ID}/p2`,
    ]);
  });

  it("doesn't include an avatar publicId in the cleanup call when the user had none", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: USER_ID, role: "artisan" } });
    findUniqueMock.mockResolvedValueOnce({ id: USER_ID, passwordHash: "hashed", avatar: null });
    bcryptCompareMock.mockResolvedValueOnce(true);
    findManyMock.mockResolvedValueOnce([]);

    await DELETE(makeRequest({ password: "senha1234" }));

    expect(deleteCloudinaryAssetsMock).toHaveBeenCalledWith([]);
  });
});
