import { describe, it, expect, vi, beforeEach } from "vitest";

const findUniqueMock = vi.fn();
const findManyMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
      findMany: (...args: unknown[]) => findManyMock(...args),
    },
  },
}));

import {
  getProductById,
  getAllProducts,
  getProductsByArtisanId,
} from "../../../services/product.service";

const VALID_ID = "507f1f77bcf86cd799439011"; // valid 24-char hex ObjectId
const VALID_ARTISAN_ID = "507f191e810c19729de860ea";

function makeProduct(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: VALID_ID,
    artisanId: VALID_ARTISAN_ID,
    name: "Vaso de cerâmica",
    description: "Feito à mão",
    images: [{ url: "https://res.cloudinary.com/test-cloud/image/upload/products/vaso1.jpg", publicId: "artisan-hub/products/507f191e810c19729de860ea/vaso1" }],
    price: 120,
    stock: 3,
    createdAt: new Date("2026-01-15T10:00:00.000Z"),
    ...overrides,
  };
}

function makeArtisan(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: VALID_ARTISAN_ID,
    name: "Ana Artesã",
    avatar: null,
    bio: "Ceramista há 10 anos",
    phone: null,
    instagram: null,
    location: "Belo Horizonte, MG",
    createdAt: new Date("2020-05-01T00:00:00.000Z"),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_CLOUDINARY_NAME = "test-cloud";
});

describe("getProductById", () => {
  it("returns null without querying the database when the id is not a valid ObjectId", async () => {
    const result = await getProductById("not-a-valid-id");

    expect(result).toBeNull();
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("returns null when the product does not exist", async () => {
    findUniqueMock.mockResolvedValueOnce(null);

    const result = await getProductById(VALID_ID);

    expect(result).toBeNull();
    expect(findManyMock).not.toHaveBeenCalled();
  });

  it("maps the product, its artisan, and related products on success", async () => {
    const product = makeProduct({ artisan: makeArtisan() });
    findUniqueMock.mockResolvedValueOnce(product);
    findManyMock.mockResolvedValueOnce([
      makeProduct({ id: "507f1f77bcf86cd799439099", name: "Outro produto" }),
    ]);

    const result = await getProductById(VALID_ID);

    expect(result).not.toBeNull();
    expect(result!.id).toBe(VALID_ID);
    expect(result!.artisan.id).toBe(VALID_ARTISAN_ID);
    expect(result!.relatedProducts).toHaveLength(1);
    expect(result!.relatedProducts[0].name).toBe("Outro produto");
    // Dates should be serialized to ISO strings for the API boundary.
    expect(result!.createdAt).toBe("2026-01-15T10:00:00.000Z");
  });

  it("excludes the product itself and limits related products to 4, newest first", async () => {
    const product = makeProduct({ artisan: makeArtisan() });
    findUniqueMock.mockResolvedValueOnce(product);
    findManyMock.mockResolvedValueOnce([]);

    await getProductById(VALID_ID);

    expect(findManyMock).toHaveBeenCalledWith({
      where: { artisanId: VALID_ARTISAN_ID, id: { not: VALID_ID } },
      orderBy: { createdAt: "desc" },
      take: 4,
    });
  });

  it("only selects public artisan fields (never email) via the include", async () => {
    const product = makeProduct({ artisan: makeArtisan() });
    findUniqueMock.mockResolvedValueOnce(product);
    findManyMock.mockResolvedValueOnce([]);

    await getProductById(VALID_ID);

    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { id: VALID_ID },
      include: {
        artisan: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            phone: true,
            instagram: true,
            location: true,
            createdAt: true,
          },
        },
      },
    });
  });

  it("never exposes the artisan's email on the mapped product", async () => {
    const product = makeProduct({ artisan: makeArtisan() });
    findUniqueMock.mockResolvedValueOnce(product);
    findManyMock.mockResolvedValueOnce([]);

    const result = await getProductById(VALID_ID);

    expect(result!.artisan).not.toHaveProperty("email");
  });
});

describe("getAllProducts", () => {
  it("returns all products mapped, newest first", async () => {
    findManyMock.mockResolvedValueOnce([makeProduct()]);

    const result = await getAllProducts();

    expect(result).toHaveLength(1);
    expect(findManyMock).toHaveBeenCalledWith({ orderBy: { createdAt: "desc" } });
  });

  it("passes a take limit through to Prisma when provided", async () => {
    findManyMock.mockResolvedValueOnce([]);

    await getAllProducts(10);

    expect(findManyMock).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  });
});

describe("getProductsByArtisanId", () => {
  it("returns an empty array without querying when the artisan id is invalid", async () => {
    const result = await getProductsByArtisanId("bad-id");

    expect(result).toEqual([]);
    expect(findManyMock).not.toHaveBeenCalled();
  });

  it("queries products scoped to the given artisan", async () => {
    findManyMock.mockResolvedValueOnce([makeProduct()]);

    const result = await getProductsByArtisanId(VALID_ARTISAN_ID);

    expect(result).toHaveLength(1);
    expect(findManyMock).toHaveBeenCalledWith({
      where: { artisanId: VALID_ARTISAN_ID },
      orderBy: { createdAt: "desc" },
    });
  });
});
