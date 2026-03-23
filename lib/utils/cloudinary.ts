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