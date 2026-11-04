import { describe, it, expect, vi, beforeEach } from "vitest";

const productFindFirstMock = vi.fn();
const userFindFirstMock = vi.fn();
const deleteCloudinaryAssetsMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { findFirst: (...args: unknown[]) => productFindFirstMock(...args) },
    user: { findFirst: (...args: unknown[]) => userFindFirstMock(...args) },
  },
}));

vi.mock("@/lib/utils/cloudinary.server", () => ({
  deleteCloudinaryAssets: (...args: unknown[]) => deleteCloudinaryAssetsMock(...args),
}));

import { isCloudinaryAssetInUse, deleteOrphanedCloudinaryAssets } from "@/lib/services/media.service";

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
