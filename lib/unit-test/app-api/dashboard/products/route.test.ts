import { describe, it, expect, vi, beforeEach } from "vitest";

const getServerSessionMock = vi.fn();
const findManyMock = vi.fn();
const createMock = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => getServerSessionMock(...args),
}));

vi.mock("@/lib/utils/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: (...args: unknown[]) => findManyMock(...args),
      create: (...args: unknown[]) => createMock(...args),
    },
  },
}));

import { GET, POST } from "@/app/api/dashboard/products/route";

const ARTISAN_ID = "artisan-1";
const OWNED_IMAGE = {
  url: "https://res.cloudinary.com/demo/image/upload/artisan-hub/products/artisan-1/vaso1",
  publicId: "artisan-hub/products/artisan-1/vaso1",
};

function makeRequest(body: unknown, withOrigin = true) {
  return new Request("https://x/api/dashboard/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(withOrigin ? { origin: "https://x", host: "x" } : {}),
    },
    body: JSON.stringify(body),
  });
}

function validProduct(overrides: Record<string, unknown> = {}) {
  return {
    name: "Vaso de cerâmica",
    description: "Feito à mão",
    images: [OWNED_IMAGE],
    price: 120,
    stock: 3,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/dashboard/products", () => {
  it("returns 401 without a session", async () => {
    getServerSessionMock.mockResolvedValueOnce(null);

    const res = await GET();

    expect(res.status).toBe(401);
    expect(findManyMock).not.toHaveBeenCalled();
  });

  it("returns only the current artisan's products", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: ARTISAN_ID } });
    findManyMock.mockResolvedValueOnce([{ id: "p1" }]);

    const res = await GET();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ products: [{ id: "p1" }] });
    expect(findManyMock).toHaveBeenCalledWith({
      where: { artisanId: ARTISAN_ID },
      orderBy: { createdAt: "desc" },
    });
  });
});

describe("POST /api/dashboard/products", () => {
  it("returns 403 when the request's Origin doesn't match its Host (CSRF protection)", async () => {
    const res = await POST(makeRequest(validProduct(), false));

    expect(res.status).toBe(403);
    expect(createMock).not.toHaveBeenCalled();
    expect(getServerSessionMock).not.toHaveBeenCalled();
  });

  it("returns 401 without a session", async () => {
    getServerSessionMock.mockResolvedValueOnce(null);

    const res = await POST(makeRequest(validProduct()));

    expect(res.status).toBe(401);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("creates a product scoped to the session's artisan id", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: ARTISAN_ID } });
    createMock.mockResolvedValueOnce({ id: "p1", ...validProduct() });

    const res = await POST(makeRequest(validProduct()));

    expect(res.status).toBe(201);
    expect(createMock).toHaveBeenCalledWith({
      data: { ...validProduct(), artisanId: ARTISAN_ID },
    });
  });

  it.each([
    ["missing name", { name: "" }],
    ["name too long", { name: "a".repeat(121) }],
    ["missing description", { description: "" }],
    ["description too long", { description: "a".repeat(4001) }],
    ["no images", { images: [] }],
    ["more than 6 images", { images: Array(7).fill(OWNED_IMAGE) }],
    ["negative price", { price: -5 }],
    ["non-numeric price", { price: "not-a-number" }],
    ["non-integer stock", { stock: 1.5 }],
    ["negative stock", { stock: -1 }],
  ])("rejects with 400 for %s", async (_label, overrides) => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: ARTISAN_ID } });

    const res = await POST(makeRequest(validProduct(overrides)));

    expect(res.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("rejects an image whose publicId doesn't belong to the current artisan (ownership check)", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: ARTISAN_ID } });

    const res = await POST(
      makeRequest(
        validProduct({
          images: [{ url: "https://x/y.jpg", publicId: "artisan-hub/products/someone-else/y" }],
        })
      )
    );

    expect(res.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("rejects an image object missing a publicId (plain URL strings are no longer accepted)", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: ARTISAN_ID } });

    const res = await POST(makeRequest(validProduct({ images: ["products/vaso1.jpg"] })));

    expect(res.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });
});
