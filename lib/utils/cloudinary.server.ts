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
 * deletion that has already committed in the database. Called whenever a
 * stored image stops being referenced (removed from a product, avatar
 * replaced/removed, product deleted, account deleted).
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
