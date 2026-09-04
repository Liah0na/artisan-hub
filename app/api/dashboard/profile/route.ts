import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { validateProfile, PROFILE_VALIDATION_ERROR } from "@/lib/validations/profile";
import { deleteCloudinaryAsset } from "@/lib/utils/cloudinary.server";
import { isTrustedOrigin, originRejectedResponse } from "@/lib/utils/verify-origin";

// This is the account owner's own private view of their profile — unlike
// the public artisan.service, it's fine (and necessary) to include email
// here (item #1/#2: email is private, not public — the owner is always
// allowed to see their own).
const PRIVATE_PROFILE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  bio: true,
  phone: true,
  instagram: true,
  location: true,
} as const;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: PRIVATE_PROFILE_SELECT,
  });

  if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  if (!isTrustedOrigin(request)) return originRejectedResponse();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const profile = body ? validateProfile(body, session.user.id) : null;

  if (!profile) {
    return NextResponse.json({ error: PROFILE_VALIDATION_ERROR }, { status: 400 });
  }

  const avatarChanging = "avatar" in profile;
  let previousAvatarPublicId: string | null = null;

  if (avatarChanging) {
    const current = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true },
    });
    previousAvatarPublicId = current?.avatar?.publicId ?? null;
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: profile,
    select: PRIVATE_PROFILE_SELECT,
  });

  // Item #6: if the avatar was replaced or removed, the old Cloudinary
  // asset is no longer referenced by anything — delete it, unless it's
  // literally the same asset that was just re-submitted unchanged.
  if (avatarChanging && previousAvatarPublicId && previousAvatarPublicId !== profile.avatar?.publicId) {
    await deleteCloudinaryAsset(previousAvatarPublicId);
  }

  return NextResponse.json(updated);
}
