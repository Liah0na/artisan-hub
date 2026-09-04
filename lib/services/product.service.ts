import { prisma } from "@/lib/prisma";
import { buildCloudinaryUrl } from "@/lib/utils/cloudinary";
import { Product } from "@/lib/types/product";
import { Artisan } from "@/lib/types/artisan";

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

// Same public/private split as artisan.service.ts (item #2): products are
// public, but the artisan relation embedded in a product response must
// only carry public fields — never email.
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

type CloudinaryAssetRecord = { url: string; publicId: string };

type PublicArtisanRecord = {
  id: string;
  name: string;
  avatar: CloudinaryAssetRecord | null;
  bio: string | null;
  phone: string | null;
  instagram: string | null;
  location: string | null;
  createdAt: Date;
};

function mapProduct(product: {
  id: string;
  artisanId: string;
  name: string;
  description: string;
  images: CloudinaryAssetRecord[];
  price: number;
  stock: number;
  createdAt: Date;
}): Product {
  return {
    id: product.id,
    artisanId: product.artisanId,
    name: product.name,
    description: product.description,
    images: product.images.map((image) => buildCloudinaryUrl(image.publicId, 1000)),
    price: product.price,
    stock: product.stock,
    createdAt: product.createdAt.toISOString(),
  };
}

function mapArtisan(user: PublicArtisanRecord): Artisan {
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar ? buildCloudinaryUrl(user.avatar.publicId, 1000) : null,
    bio: user.bio,
    phone: user.phone,
    instagram: user.instagram,
    location: user.location,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function getProductById(id: string) {
  if (!OBJECT_ID_RE.test(id)) return null;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { artisan: { select: PUBLIC_ARTISAN_SELECT } },
  });
  if (!product) return null;

  const relatedProducts = await prisma.product.findMany({
    where: { artisanId: product.artisanId, id: { not: product.id } },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return {
    ...mapProduct(product),
    artisan: mapArtisan(product.artisan),
    relatedProducts: relatedProducts.map(mapProduct),
  };
}

export async function getAllProducts(limit?: number): Promise<Product[]> {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    ...(limit ? { take: limit } : {})
  });
  
  return products.map(mapProduct);
}

export async function getProductsByArtisanId(artisanId: string): Promise<Product[]> {
  if (!OBJECT_ID_RE.test(artisanId)) return [];

  const products = await prisma.product.findMany({
    where: { artisanId },
    orderBy: { createdAt: "desc" },
  });
  return products.map(mapProduct);
}
