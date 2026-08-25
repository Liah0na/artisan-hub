import { prisma } from "@/lib/prisma";
import { buildCloudinaryUrl } from "@/lib/utils/cloudinary";
import { Product } from "@/lib/types/product";
import { Artisan } from "@/lib/types/artisan";

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

type ArtisanRecord = {
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

function mapProduct(product: {
  id: string;
  artisanId: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  stock: number;
  createdAt: Date;
}): Product {
  return {
    id: product.id,
    artisanId: product.artisanId,
    name: product.name,
    description: product.description,
    images: product.images.map((url) => buildCloudinaryUrl(url, 1000)),
    price: product.price,
    stock: product.stock,
    createdAt: product.createdAt.toISOString(),
  };
}

function mapArtisan(user: ArtisanRecord): Artisan {
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

export async function getProductById(id: string) {
  if (!OBJECT_ID_RE.test(id)) return null;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { artisan: true },
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

export async function getAllProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 3 });
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
