import { MAX_UPLOAD_LABEL } from "@/lib/utils/cloudinary";

export type UploadedAsset = { url: string; publicId: string };

/**
 * Parses an upload API response. Platform-level rejections (e.g. Vercel's
 * 413 for oversized bodies) aren't JSON, so never assume the body parses.
 */
export async function readUploadResponse(
  response: Response,
  fallbackError: string
): Promise<UploadedAsset> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 413) {
      throw new Error(`A imagem deve ter no máximo ${MAX_UPLOAD_LABEL}.`);
    }
    throw new Error(data?.error || fallbackError);
  }

  return { url: data.url as string, publicId: data.publicId as string };
}
