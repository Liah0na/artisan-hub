import { describe, it, expect, vi, beforeEach } from "vitest";

const getServerSessionMock = vi.fn();
const findManyMock = vi.fn();
const createMock = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => getServerSessionMock(...args),
}));

vi.mock("@/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: (...args: unknown[]) => findManyMock(...args),
      create: (...args: unknown[]) => createMock(...args),
    },
  },
}));

import { GET, POST } from "@/app/api/dashboard/products/route";

function makeRequest(body: unknown) {
  return new Request("https://x/api/dashboard/products", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function validProduct(overrides: Record<string, unknown> = {}) {
  return {
    name: "Vaso de cerâmica",
    description: "Feito à mão",
    images: ["products/vaso1.jpg"],
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
    getServerSessionMock.mockResolvedValueOnce({ user: { id: "artisan-1" } });
    findManyMock.mockResolvedValueOnce([{ id: "p1" }]);

    const res = await GET();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ products: [{ id: "p1" }] });
    expect(findManyMock).toHaveBeenCalledWith({
      where: { artisanId: "artisan-1" },
      orderBy: { createdAt: "desc" },
    });
  });
});

describe("POST /api/dashboard/products", () => {
  it("returns 401 without a session", async () => {
    getServerSessionMock.mockResolvedValueOnce(null);

    const res = await POST(makeRequest(validProduct()));

    expect(res.status).toBe(401);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("creates a product scoped to the session's artisan id", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: "artisan-1" } });
    createMock.mockResolvedValueOnce({ id: "p1", ...validProduct() });

    const res = await POST(makeRequest(validProduct()));

    expect(res.status).toBe(201);
    expect(createMock).toHaveBeenCalledWith({
      data: { ...validProduct(), artisanId: "artisan-1" },
    });
  });

  it.each([
    ["missing name", { name: "" }],
    ["missing description", { description: "" }],
    ["no images", { images: [] }],
    ["negative price", { price: -5 }],
    ["non-numeric price", { price: "not-a-number" }],
    ["non-integer stock", { stock: 1.5 }],
    ["negative stock", { stock: -1 }],
  ])("rejects with 400 for %s", async (_label, overrides) => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: "artisan-1" } });

    const res = await POST(makeRequest(validProduct(overrides)));

    expect(res.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("filters out blank/non-string entries from the images array", async () => {
    getServerSessionMock.mockResolvedValueOnce({ user: { id: "artisan-1" } });
    createMock.mockResolvedValueOnce({ id: "p1" });

    await POST(makeRequest(validProduct({ images: ["a.jpg", "", "  ", 42, "b.jpg"] })));

    expect(createMock).toHaveBeenCalledWith({
      data: expect.objectContaining({ images: ["a.jpg", "b.jpg"] }),
    });
  });
});
