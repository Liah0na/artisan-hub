/**
 * Upload limits shared by the dashboard forms and the upload API routes.
 * Uploads are proxied through a Vercel serverless function, whose request
 * body cap is ~4.5 MB — keep this below that so oversized files get our own
 * error message instead of a raw 413 from the platform.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "4 MB";

/**
 * Per-user upload quota, shared by the avatar and product-image routes. A
 * full product is at most 6 images, so this leaves room for several products
 * (and retries) in an hour while capping how much Cloudinary storage and
 * bandwidth a single account can burn.
 */
export const UPLOAD_RATE_LIMIT = 30;
export const UPLOAD_RATE_WINDOW_MS = 60 * 60 * 1000;

export function buildCloudinaryUrl(
  src: string,
  size: number = 200,
  quality: number = 75
) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_NAME;
  
  if (!src) return "/default.jpg";

  if (src.startsWith("http")) return src;

  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_${quality},w_${size},h_${size},c_fill/${src}`;
}

/**
 * Every upload goes into a folder scoped to the uploading user
 * (`artisan-hub/<kind>/<userId>/...`, see the upload routes). Before
 * persisting a Cloudinary asset reference submitted by the client (profile
 * avatar, product images), the server must confirm the public_id actually
 * lives under *that* user's folder — otherwise a user could submit someone
 * else's public_id and have it displayed (or even deleted) as if it were
 * their own.
 */
export function ownedCloudinaryFolder(kind: "avatars" | "products", userId: string) {
  return `artisan-hub/${kind}/${userId}/`;
}

export function isOwnedCloudinaryAsset(
  publicId: string,
  kind: "avatars" | "products",
  userId: string
): boolean {
  if (typeof publicId !== "string" || !publicId) return false;
  return publicId.startsWith(ownedCloudinaryFolder(kind, userId));
}