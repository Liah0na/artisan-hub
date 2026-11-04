import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

/**
 * Best-effort delete of a single Cloudinary asset. Failures are logged but
 * never thrown — a Cloudinary hiccup should never block a product/account
 * deletion that has already committed in the database.
 *
 * This is a low-level primitive: it does NOT check whether the publicId is
 * still referenced by another Product/User in the database. Any call site
 * cleaning up an image because a product/profile stopped referencing it
 * should go through deleteOrphanedCloudinaryAsset(s) in
 * lib/services/media.service.ts instead, which does that check first.
 */
export async function deleteCloudinaryAsset(publicId: string | null | undefined) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete Cloudinary asset ${publicId}:`, error);
  }
}

export async function deleteCloudinaryAssets(publicIds: Array<string | null | undefined>) {
  await Promise.all(publicIds.map((id) => deleteCloudinaryAsset(id)));
}
