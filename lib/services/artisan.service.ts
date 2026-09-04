import { prisma } from "@/lib/prisma";
import { buildCloudinaryUrl } from "@/lib/utils/cloudinary";
import { Artisan } from "@/lib/types/artisan";

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

// Explicit `select` (item #2): only the fields that make up the *public*
// artisan profile ever leave the database layer here. In particular,
// `email` is never selected — it's private account data (item #1) and is
// only ever returned by the authenticated /api/dashboard/profile route.
const PUBLIC_ARTISAN_SELECT = {
  id: true,
  name: true,
  avatar: true,
  bio: true,
  phone: true,
  instagram: true,
  location: true,
  createdAt: true,
} as const;

type PublicArtisanRecord = {
  id: string;
  name: string;
  avatar: { url: string; publicId: string } | null;
  bio: string | null;
  phone: string | null;
  instagram: string | null;
  location: string | null;
  createdAt: Date;
};

function mapArtisan(user: PublicArtisanRecord, avatarSize = 1000): Artisan {
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar ? buildCloudinaryUrl(user.avatar.publicId, avatarSize) : null,
    bio: user.bio,
    phone: user.phone,
    instagram: user.instagram,
    location: user.location,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function getArtisanById(id: string): Promise<Artisan | null> {
  if (!OBJECT_ID_RE.test(id)) return null;

  const user = await prisma.user.findUnique({ where: { id }, select: PUBLIC_ARTISAN_SELECT });
  if (!user) return null;

  return mapArtisan(user);
}

export async function getArtisans(limit?: number): Promise<Artisan[]> {
  const users = await prisma.user.findMany({
    where: { role: "artisan" },
    orderBy: { createdAt: "desc" },
    select: PUBLIC_ARTISAN_SELECT,
    ...(limit ? { take: limit } : {}),
  });

  return users.map((user) => mapArtisan(user, 500));
}
