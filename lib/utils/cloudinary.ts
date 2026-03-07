const cloudName = process.env.PUBLIC_CLOUDINARY_CLOUD_NAME;

export function buildCloudinaryUrl(
  publicId: string,
  width: number,
  quality: number = 75
) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_${quality},w_${width}/${publicId}`;
}