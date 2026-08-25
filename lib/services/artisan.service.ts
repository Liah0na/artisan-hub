import { prisma } from "@/lib/prisma";
import { buildCloudinaryUrl } from "@/lib/utils/cloudinary";
import { Artisan } from "@/lib/types/artisan";

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

export async function getArtisanById(id: string): Promise<Artisan | null> {
  if (!OBJECT_ID_RE.test(id)) return null;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar ? buildCloudinaryUrl(user.avatar, 1000) : null,
    bio: user.bio,
    phone: user.phone,
    instagram: user.instagram,
    location: user.location,
    createdAt: user.createdAt.toISOString(),
  };
}
