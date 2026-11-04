import { describe, it, expect, vi, beforeEach } from "vitest";

const productFindFirstMock = vi.fn();
const userFindFirstMock = vi.fn();
const deleteCloudinaryAssetsMock = vi.fn();
const productFindManyMock = vi.fn();
const userFindManyMock = vi.fn();
const resourcesMock = vi.fn();
const deleteResourcesMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findFirst: (...args: unknown[]) => productFindFirstMock(...args),
      findMany: (...args: unknown[]) => productFindManyMock(...args),
    },
    user: {
      findFirst: (...args: unknown[]) => userFindFirstMock(...args),
      findMany: (...args: unknown[]) => userFindManyMock(...args),
    },
  },
}));

vi.mock("@/lib/utils/cloudinary.server", () => ({
  deleteCloudinaryAssets: (...args: unknown[]) => deleteCloudinaryAssetsMock(...args),
  cloudinary: {
    api: {
      resources: (...args: unknown[]) => resourcesMock(...args),
      delete_resources: (...args: unknown[]) => deleteResourcesMock(...args),
    },
  },
}));

import {
  isCloudinaryAssetInUse,
  deleteOrphanedCloudinaryAssets,
  purgeOrphanedUploads,
} from "@/lib/services/media.service";

const PUBLIC_ID = "artisan-hub/products/artisan-1/abc";

beforeEach(() => {
  vi.clearAllMocks();
  productFindFirstMock.mockResolvedValue(null);
  userFindFirstMock.mockResolvedValue(null);
});

describe("isCloudinaryAssetInUse", () => {
  it("returns false when no product or user references the publicId", async () => {
    await expect(isCloudinaryAssetInUse(PUBLIC_ID)).resolves.toBe(false);
  });

  it("returns true when another product still references the publicId", async () => {
    productFindFirstMock.mockResolvedValueOnce({ id: "other-product" });

    await expect(isCloudinaryAssetInUse(PUBLIC_ID)).resolves.toBe(true);
  });

  it("returns true when a user's avatar still references the publicId", async () => {
    userFindFirstMock.mockResolvedValueOnce({ id: "some-user" });

    await expect(isCloudinaryAssetInUse(PUBLIC_ID)).resolves.toBe(true);
  });

  it("queries by publicId using the composite `some`/`is` filters", async () => {
    await isCloudinaryAssetInUse(PUBLIC_ID);

    expect(productFindFirstMock).toHaveBeenCalledWith({
      where: { images: { some: { publicId: PUBLIC_ID } } },
      select: { id: true },
    });
    expect(userFindFirstMock).toHaveBeenCalledWith({
      where: { avatar: { is: { publicId: PUBLIC_ID } } },
      select: { id: true },
    });
  });

  it("excludes the product/user currently being edited from the check", async () => {
    await isCloudinaryAssetInUse(PUBLIC_ID, { excludeProductId: "p1", excludeUserId: "u1" });

    expect(productFindFirstMock).toHaveBeenCalledWith({
      where: { images: { some: { publicId: PUBLIC_ID } }, id: { not: "p1" } },
      select: { id: true },
    });
    expect(userFindFirstMock).toHaveBeenCalledWith({
      where: { avatar: { is: { publicId: PUBLIC_ID } }, id: { not: "u1" } },
      select: { id: true },
    });
  });
});

describe("deleteOrphanedCloudinaryAssets", () => {
  it("deletes a publicId that isn't referenced anywhere else", async () => {
    await deleteOrphanedCloudinaryAssets([PUBLIC_ID]);

    expect(deleteCloudinaryAssetsMock).toHaveBeenCalledWith([PUBLIC_ID]);
  });

  it("does NOT delete a publicId that's still referenced by another product", async () => {
    productFindFirstMock.mockResolvedValueOnce({ id: "other-product" });

    await deleteOrphanedCloudinaryAssets([PUBLIC_ID]);

    expect(deleteCloudinaryAssetsMock).toHaveBeenCalledWith([]);
  });

  it("does NOT delete a publicId that's still referenced by a user's avatar", async () => {
    userFindFirstMock.mockResolvedValueOnce({ id: "some-user" });

    await deleteOrphanedCloudinaryAssets([PUBLIC_ID]);

    expect(deleteCloudinaryAssetsMock).toHaveBeenCalledWith([]);
  });

  it("only deletes the orphaned subset out of a mixed batch", async () => {
    const stillUsed = "artisan-hub/products/artisan-1/still-used";
    const orphaned = "artisan-hub/products/artisan-1/orphaned";

    productFindFirstMock.mockImplementation(({ where }: { where: { images: { some: { publicId: string } } } }) =>
      where.images.some.publicId === stillUsed ? Promise.resolve({ id: "other-product" }) : Promise.resolve(null)
    );

    await deleteOrphanedCloudinaryAssets([stillUsed, orphaned]);

    expect(deleteCloudinaryAssetsMock).toHaveBeenCalledWith([orphaned]);
  });

  it("de-duplicates and drops null/undefined publicIds before checking anything", async () => {
    await deleteOrphanedCloudinaryAssets([PUBLIC_ID, PUBLIC_ID, null, undefined]);

    expect(productFindFirstMock).toHaveBeenCalledTimes(1);
    expect(deleteCloudinaryAssetsMock).toHaveBeenCalledWith([PUBLIC_ID]);
  });

  it("does nothing (and never queries the database) for an empty/all-nullish list", async () => {
    await deleteOrphanedCloudinaryAssets([null, undefined]);

    expect(productFindFirstMock).not.toHaveBeenCalled();
    expect(deleteCloudinaryAssetsMock).not.toHaveBeenCalled();
  });

  it("forwards excludeProductId/excludeUserId down to the reference check", async () => {
    await deleteOrphanedCloudinaryAssets([PUBLIC_ID], { excludeProductId: "p1", excludeUserId: "u1" });

    expect(productFindFirstMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: { not: "p1" } }) })
    );
    expect(userFindFirstMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: { not: "u1" } }) })
    );
  });
});

describe("purgeOrphanedUploads", () => {
  const NOW = new Date("2026-11-03T12:00:00Z");
  const OLD = "2026-11-01T12:00:00Z"; // older than the 24h grace period
  const FRESH = "2026-11-03T06:00:00Z"; // inside it

  function stubAssets(byPrefix: Record<string, Array<{ public_id: string; created_at: string }>>) {
    resourcesMock.mockImplementation(async ({ prefix }: { prefix: string }) => ({
      resources: byPrefix[prefix] ?? [],
    }));
  }

  beforeEach(() => {
    productFindManyMock.mockResolvedValue([]);
    userFindManyMock.mockResolvedValue([]);
    deleteResourcesMock.mockResolvedValue({});
  });

  it("deletes old assets that no product or avatar references", async () => {
    stubAssets({
      "artisan-hub/products/": [
        { public_id: "artisan-hub/products/u1/used", created_at: OLD },
        { public_id: "artisan-hub/products/u1/orphan", created_at: OLD },
      ],
      "artisan-hub/avatars/": [
        { public_id: "artisan-hub/avatars/u1/current", created_at: OLD },
        { public_id: "artisan-hub/avatars/u1/old", created_at: OLD },
      ],
    });
    productFindManyMock.mockResolvedValue([{ images: [{ publicId: "artisan-hub/products/u1/used" }] }]);
    userFindManyMock.mockResolvedValue([
      { avatar: { publicId: "artisan-hub/avatars/u1/current" } },
      { avatar: null },
    ]);

    const result = await purgeOrphanedUploads(NOW);

    expect(deleteResourcesMock).toHaveBeenCalledTimes(1);
    expect(deleteResourcesMock.mock.calls[0][0].sort()).toEqual([
      "artisan-hub/avatars/u1/old",
      "artisan-hub/products/u1/orphan",
    ]);
    expect(result).toEqual({ scanned: 4, deleted: 2 });
  });

  it("leaves unreferenced assets inside the grace period alone", async () => {
    stubAssets({
      "artisan-hub/products/": [{ public_id: "artisan-hub/products/u1/in-progress", created_at: FRESH }],
    });

    const result = await purgeOrphanedUploads(NOW);

    expect(deleteResourcesMock).not.toHaveBeenCalled();
    expect(result).toEqual({ scanned: 1, deleted: 0 });
  });

  it("follows Cloudinary pagination and deletes in batches of 100", async () => {
    const page = (start: number) =>
      Array.from({ length: 100 }, (_, i) => ({
        public_id: `artisan-hub/products/u1/img-${start + i}`,
        created_at: OLD,
      }));
    resourcesMock.mockImplementation(async ({ prefix, next_cursor }: { prefix: string; next_cursor?: string }) => {
      if (prefix !== "artisan-hub/products/") return { resources: [] };
      return next_cursor
        ? { resources: page(100).slice(0, 50) }
        : { resources: page(0), next_cursor: "page-2" };
    });

    const result = await purgeOrphanedUploads(NOW);

    expect(result).toEqual({ scanned: 150, deleted: 150 });
    expect(deleteResourcesMock).toHaveBeenCalledTimes(2);
    expect(deleteResourcesMock.mock.calls[0][0]).toHaveLength(100);
    expect(deleteResourcesMock.mock.calls[1][0]).toHaveLength(50);
  });
});
