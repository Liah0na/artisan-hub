import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/utils/auth";
import { rateLimit } from "@/lib/rate-limit";
import {
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_LABEL,
  UPLOAD_RATE_LIMIT,
  UPLOAD_RATE_WINDOW_MS,
} from "@/lib/utils/cloudinary";
import { uploadImageBuffer } from "@/lib/utils/cloudinary.server";
import { isTrustedOrigin, originRejectedResponse } from "@/lib/utils/verify-origin";

export const runtime = "nodejs";

const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) return originRejectedResponse();

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return NextResponse.json(
      { error: "Cloudinary não está configurado no servidor." },
      { status: 500 }
    );
  }

  // Checked before reading the body so a flood of requests is rejected
  // cheaply. One bucket per user, shared by both upload routes.
  const { success } = await rateLimit(
    `upload:${session.user.id}`,
    UPLOAD_RATE_LIMIT,
    UPLOAD_RATE_WINDOW_MS
  );
  if (!success) {
    return NextResponse.json(
      { error: "Muitos envios de imagem. Tente novamente mais tarde." },
      { status: 429 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Selecione uma imagem." }, { status: 400 });
  }

  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Use uma imagem JPG, PNG ou WebP." },
      { status: 400 }
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `A imagem deve ter no máximo ${MAX_UPLOAD_LABEL}.` },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const upload = await uploadImageBuffer(buffer, {
    folder: `artisan-hub/avatars/${session.user.id}`,
    resource_type: "image",
    transformation: [{ width: 600, height: 600, crop: "fill", gravity: "face" }],
  });

  return NextResponse.json({
    url: upload.secure_url,
    publicId: upload.public_id,
  });
}
