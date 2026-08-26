import { prisma } from "@/lib/prisma";
import { buildCloudinaryUrl } from "@/lib/utils/cloudinary";
import { Artisan } from "@/lib/types/artisan";

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

type UserRecord = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  phone: string | null;
  instagram: string | null;
  location: string | null;
  createdAt: Date;
};

function mapArtisan(user: UserRecord, avatarSize = 1000): Artisan {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar ? buildCloudinaryUrl(user.avatar, avatarSize) : null,
    bio: user.bio,
    phone: user.phone,
    instagram: user.instagram,
    location: user.location,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function getArtisanById(id: string): Promise<Artisan | null> {
  if (!OBJECT_ID_RE.test(id)) return null;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return null;

  return mapArtisan(user);
}

export async function getArtisans(limit?: number): Promise<Artisan[]> {
  const users = await prisma.user.findMany({
    where: { role: "artisan" },
    orderBy: { createdAt: "desc" },
    ...(limit ? { take: limit } : {}),
  });

  return users.map((user) => mapArtisan(user, 500));
}
