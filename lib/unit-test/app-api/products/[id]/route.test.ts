import { describe, it, expect, vi, beforeEach } from "vitest";

const getProductByIdMock = vi.fn();

vi.mock("@/lib/services/product.service", () => ({
  getProductById: (...args: unknown[]) => getProductByIdMock(...args),
}));

import { GET } from "@/app/api/products/[id]/route";

const VALID_ID = "507f1f77bcf86cd799439011";

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/products/[id]", () => {
  it("returns 400 when the route param id is empty", async () => {
    const res = await GET(new Request("https://x/api/products/"), makeParams(""));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid product id" });
    expect(getProductByIdMock).not.toHaveBeenCalled();
  });

  it("returns 404 when the product is not found", async () => {
    getProductByIdMock.mockResolvedValueOnce(null);

    const res = await GET(new Request(`https://x/api/products/${VALID_ID}`), makeParams(VALID_ID));

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Product not found" });
  });

  it("returns the product wrapped in { product } on success", async () => {
    const product = { id: VALID_ID, name: "Vaso" };
    getProductByIdMock.mockResolvedValueOnce(product);

    const res = await GET(new Request(`https://x/api/products/${VALID_ID}`), makeParams(VALID_ID));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ product });
  });

  it("returns 500 when the service throws", async () => {
    getProductByIdMock.mockRejectedValueOnce(new Error("db down"));

    const res = await GET(new Request(`https://x/api/products/${VALID_ID}`), makeParams(VALID_ID));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Internal server error" });
  });
});
