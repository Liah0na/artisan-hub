import { describe, it, expect, vi, beforeEach } from "vitest";

const getServerSessionMock = vi.fn();
const findFirstMock = vi.fn();
const updateMock = vi.fn();
const deleteMock = vi.fn();
const deleteCloudinaryAssetsMock = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => getServerSessionMock(...args),
}));

vi.mock("@/lib/utils/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findFirst: (...args: unknown[]) => findFirstMock(...args),
      update: (...args: unknown[]) => updateMock(...args),
      delete: (...args: unknown[]) => deleteMock(...args),
    },
  },
}));

vi.mock("@/lib/utils/cloudinary.server", () => ({
  deleteCloudinaryAssets: (...args: unknown[]) => deleteCloudinaryAssetsMock(...args),
}));

import { PATCH, DELETE } from "@/app/api/dashboard/products/[id]/route";

const ARTISAN_ID = "artisan-1";
const PRODUCT_ID = "p1";

function image(name: string) {
  return {
    url: `https://res.cloudinary.com/demo/image/upload/artisan-hub/products/${ARTISAN_ID}/${name}`,
    publicId: `artisan-hub/products/${ARTISAN_ID}/${name}`,
  };
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

function validProduct(overrides: Record<string, unknown> = {}) {
  return {
    name: "Vaso",
    description: "Feito à mão",
    images: [image("a")],
    price: 100,
    stock: 2,
    ...overrides,
  };
}

function makeRequest(method: "PATCH" | "DELETE", body?: unknown, withOrigin = true) {
  return new Request(`https://x/api/dashboard/products/${PRODUCT_ID}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(withOrigin ? { origin: "https://x", host: "x" } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PATCH /api/dashboard/products/[id]", () => {
  it("returns 403 when the request's Origin doesn't match its Host", async () => {
    const res = await PATCH(makeRequest("PATCH", validProduct(), false), makeParams(PRODUCT_ID));

    expect(res.status).toBe(403);
    expect(getServerSessionMock).not.toHaveBeenCalled();
  });

  it("returns 401 without a session", async () => {
    getServerSessionMock.mockResolvedValueOnce(null);

    const res = await PATCH(makeRequest("PATCH", validProduct()), makeParams(PRODUCT_ID));

    expect(res.status).toBe(401);
    expect(findFirstMock).not.toHaveBeenCalled();
  });

  it("returns 404 when the product isn't owned by the current artisan", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: ARTISAN_ID } });
    findFirstMock.mockResolvedValueOnce(null);

    const res = await PATCH(makeRequest("PATCH", validProduct()), makeParams(PRODUCT_ID));

    expect(res.status).toBe(404);
    expect(findFirstMock).toHaveBeenCalledWith({
      where: { id: PRODUCT_ID, artisanId: ARTISAN_ID },
    });
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid payload even when the product is owned", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: ARTISAN_ID } });
    findFirstMock.mockResolvedValueOnce({ id: PRODUCT_ID, images: [image("a")] });

    const res = await PATCH(makeRequest("PATCH", validProduct({ name: "" })), makeParams(PRODUCT_ID));

    expect(res.status).toBe(400);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("rejects an image publicId that doesn't belong to the current artisan", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: ARTISAN_ID } });
    findFirstMock.mockResolvedValueOnce({ id: PRODUCT_ID, images: [image("a")] });

    const res = await PATCH(
      makeRequest("PATCH", validProduct({ images: [{ url: "https://x/y.jpg", publicId: "artisan-hub/products/someone-else/y" }] })),
      makeParams(PRODUCT_ID)
    );

    expect(res.status).toBe(400);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("updates the product on success and doesn't touch Cloudinary when images are unchanged", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: ARTISAN_ID } });
    findFirstMock.mockResolvedValueOnce({ id: PRODUCT_ID, images: [image("a")] });
    updateMock.mockResolvedValueOnce({ id: PRODUCT_ID, ...validProduct() });

    const res = await PATCH(makeRequest("PATCH", validProduct()), makeParams(PRODUCT_ID));

    expect(res.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: PRODUCT_ID },
      data: validProduct(),
    });
    expect(deleteCloudinaryAssetsMock).not.toHaveBeenCalled();
  });

  it("deletes from Cloudinary any image that was removed/replaced in the update (item #4/#6)", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: ARTISAN_ID } });
    findFirstMock.mockResolvedValueOnce({ id: PRODUCT_ID, images: [image("a"), image("b")] });
    updateMock.mockResolvedValueOnce({ id: PRODUCT_ID });

    await PATCH(makeRequest("PATCH", validProduct({ images: [image("a")] })), makeParams(PRODUCT_ID));

    expect(deleteCloudinaryAssetsMock).toHaveBeenCalledWith([`artisan-hub/products/${ARTISAN_ID}/b`]);
  });
});

describe("DELETE /api/dashboard/products/[id]", () => {
  it("returns 403 when the request's Origin doesn't match its Host", async () => {
    const res = await DELETE(makeRequest("DELETE", undefined, false), makeParams(PRODUCT_ID));

    expect(res.status).toBe(403);
    expect(getServerSessionMock).not.toHaveBeenCalled();
  });

  it("returns 401 without a session", async () => {
    getServerSessionMock.mockResolvedValueOnce(null);

    const res = await DELETE(makeRequest("DELETE"), makeParams(PRODUCT_ID));

    expect(res.status).toBe(401);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("returns 404 when the product isn't owned by the current artisan", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: ARTISAN_ID } });
    findFirstMock.mockResolvedValueOnce(null);

    const res = await DELETE(makeRequest("DELETE"), makeParams(PRODUCT_ID));

    expect(res.status).toBe(404);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("deletes the product, cleans up its Cloudinary images, and returns 204 on success", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: ARTISAN_ID } });
    findFirstMock.mockResolvedValueOnce({ id: PRODUCT_ID, images: [image("a"), image("b")] });
    deleteMock.mockResolvedValueOnce({});

    const res = await DELETE(makeRequest("DELETE"), makeParams(PRODUCT_ID));

    expect(res.status).toBe(204);
    expect(deleteMock).toHaveBeenCalledWith({ where: { id: PRODUCT_ID } });
    expect(deleteCloudinaryAssetsMock).toHaveBeenCalledWith([
      `artisan-hub/products/${ARTISAN_ID}/a`,
      `artisan-hub/products/${ARTISAN_ID}/b`,
    ]);
  });
});
