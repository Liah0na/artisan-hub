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