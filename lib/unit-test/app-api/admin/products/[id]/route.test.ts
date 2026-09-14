import { describe, it, expect, vi, beforeEach } from "vitest";

const getServerSessionMock = vi.fn();
const updateMock = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => getServerSessionMock(...args),
}));

vi.mock("@/lib/utils/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      update: (...args: unknown[]) => updateMock(...args),
    },
  },
}));

import { PATCH } from "@/app/api/admin/products/[id]/route";

const PRODUCT_ID = "prod-1";

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makeRequest(body: unknown) {
  return new Request(`https://x/api/admin/products/${PRODUCT_ID}`, {
    method: "PATCH",
    headers: { origin: "https://x", host: "x", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PATCH /api/admin/products/[id]", () => {
  it("returns 401 without an admin/superadmin session", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "artisan" } });

    const res = await PATCH(makeRequest({ status: "approved" }), makeParams(PRODUCT_ID));

    expect(res.status).toBe(401);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it.each(["admin", "superadmin"])("allows a session with role %s", async (role) => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role } });
    updateMock.mockResolvedValueOnce({ id: PRODUCT_ID, status: "approved" });

    const res = await PATCH(makeRequest({ status: "approved" }), makeParams(PRODUCT_ID));

    expect(res.status).toBe(200);
  });

  it("rejects an invalid status value", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "admin" } });

    const res = await PATCH(makeRequest({ status: "banana" }), makeParams(PRODUCT_ID));

    expect(res.status).toBe(400);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("requires a rejectionReason when rejecting", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "admin" } });

    const res = await PATCH(makeRequest({ status: "rejected" }), makeParams(PRODUCT_ID));

    expect(res.status).toBe(400);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("stores the rejectionReason when rejecting", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "admin" } });
    updateMock.mockResolvedValueOnce({ id: PRODUCT_ID, status: "rejected" });

    await PATCH(makeRequest({ status: "rejected", rejectionReason: "Imagem imprópria" }), makeParams(PRODUCT_ID));

    expect(updateMock).toHaveBeenCalledWith({
      where: { id: PRODUCT_ID },
      data: { status: "rejected", rejectionReason: "Imagem imprópria" },
    });
  });

  it("clears rejectionReason when approving", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "admin" } });
    updateMock.mockResolvedValueOnce({ id: PRODUCT_ID, status: "approved" });

    await PATCH(makeRequest({ status: "approved" }), makeParams(PRODUCT_ID));

    expect(updateMock).toHaveBeenCalledWith({
      where: { id: PRODUCT_ID },
      data: { status: "approved", rejectionReason: null },
    });
  });

  it("returns 404 when the product does not exist", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { role: "admin" } });
    updateMock.mockRejectedValueOnce(new Error("not found"));

    const res = await PATCH(makeRequest({ status: "approved" }), makeParams(PRODUCT_ID));

    expect(res.status).toBe(404);
  });
});
