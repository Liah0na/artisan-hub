import { describe, it, expect, vi, beforeEach } from "vitest";

const getServerSessionMock = vi.fn();
const findFirstMock = vi.fn();
const updateMock = vi.fn();
const deleteMock = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => getServerSessionMock(...args),
}));

vi.mock("@/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findFirst: (...args: unknown[]) => findFirstMock(...args),
      update: (...args: unknown[]) => updateMock(...args),
      delete: (...args: unknown[]) => deleteMock(...args),
    },
  },
}));

import { PATCH, DELETE } from "@/app/api/dashboard/products/[id]/route";

const PRODUCT_ID = "p1";

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

function validProduct(overrides: Record<string, unknown> = {}) {
  return {
    name: "Vaso",
    description: "Feito à mão",
    images: ["a.jpg"],
    price: 100,
    stock: 2,
    ...overrides,
  };
}

function makeRequest(body: unknown) {
  return new Request(`https://x/api/dashboard/products/${PRODUCT_ID}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PATCH /api/dashboard/products/[id]", () => {
  it("returns 401 without a session", async () => {
    getServerSessionMock.mockResolvedValueOnce(null);

    const res = await PATCH(makeRequest(validProduct()), makeParams(PRODUCT_ID));

    expect(res.status).toBe(401);
    expect(findFirstMock).not.toHaveBeenCalled();
  });

  it("returns 404 when the product isn't owned by the current artisan", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: "artisan-1" } });
    findFirstMock.mockResolvedValueOnce(null);

    const res = await PATCH(makeRequest(validProduct()), makeParams(PRODUCT_ID));

    expect(res.status).toBe(404);
    expect(findFirstMock).toHaveBeenCalledWith({
      where: { id: PRODUCT_ID, artisanId: "artisan-1" },
    });
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid payload even when the product is owned", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: "artisan-1" } });
    findFirstMock.mockResolvedValueOnce({ id: PRODUCT_ID });

    const res = await PATCH(makeRequest(validProduct({ name: "" })), makeParams(PRODUCT_ID));

    expect(res.status).toBe(400);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("updates the product on success", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: "artisan-1" } });
    findFirstMock.mockResolvedValueOnce({ id: PRODUCT_ID });
    updateMock.mockResolvedValueOnce({ id: PRODUCT_ID, ...validProduct() });

    const res = await PATCH(makeRequest(validProduct()), makeParams(PRODUCT_ID));

    expect(res.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: PRODUCT_ID },
      data: validProduct(),
    });
  });
});

describe("DELETE /api/dashboard/products/[id]", () => {
  it("returns 401 without a session", async () => {
    getServerSessionMock.mockResolvedValueOnce(null);

    const res = await DELETE(new Request("https://x"), makeParams(PRODUCT_ID));

    expect(res.status).toBe(401);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("returns 404 when the product isn't owned by the current artisan", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: "artisan-1" } });
    findFirstMock.mockResolvedValueOnce(null);

    const res = await DELETE(new Request("https://x"), makeParams(PRODUCT_ID));

    expect(res.status).toBe(404);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("deletes the product and returns 204 on success", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: "artisan-1" } });
    findFirstMock.mockResolvedValueOnce({ id: PRODUCT_ID });
    deleteMock.mockResolvedValueOnce({});

    const res = await DELETE(new Request("https://x"), makeParams(PRODUCT_ID));

    expect(res.status).toBe(204);
    expect(deleteMock).toHaveBeenCalledWith({ where: { id: PRODUCT_ID } });
  });
});
