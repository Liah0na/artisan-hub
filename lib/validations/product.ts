import { isOwnedCloudinaryAsset } from "@/lib/utils/cloudinary";

export const MAX_PRODUCT_IMAGES = 6;
const NAME_MAX_LENGTH = 120;
const DESCRIPTION_MAX_LENGTH = 4000;

export type ProductImageInput = { url: string; publicId: string };

export type ValidatedProduct = {
  name: string;
  description: string;
  images: ProductImageInput[];
  price: number;
  stock: number;
};

export const PRODUCT_VALIDATION_ERROR =
  "Informe nome (até 120 caracteres), descrição (até 4000 caracteres), de 1 a 6 imagens enviadas por você, preço válido e estoque inteiro não negativo.";

function parseImages(raw: unknown, userId: string): ProductImageInput[] | null {
  if (!Array.isArray(raw)) return null;
  if (raw.length === 0 || raw.length > MAX_PRODUCT_IMAGES) return null;

  const images: ProductImageInput[] = [];
  for (const item of raw) {
    if (
      !item ||
      typeof item !== "object" ||
      typeof (item as ProductImageInput).url !== "string" ||
      typeof (item as ProductImageInput).publicId !== "string" ||
      !(item as ProductImageInput).url.trim() ||
      !(item as ProductImageInput).publicId.trim()
    ) {
      return null;
    }

    // Item #12: every image's publicId must live under this artisan's own
    // Cloudinary folder — prevents pointing a product at someone else's
    // uploaded asset (or one never actually uploaded through our routes).
    if (!isOwnedCloudinaryAsset((item as ProductImageInput).publicId, "products", userId)) return null;

    images.push({ url: (item as ProductImageInput).url.trim(), publicId: (item as ProductImageInput).publicId.trim() });
  }
  return images;
}

export function validateProduct(data: Record<string, unknown>, userId: string): ValidatedProduct | null {
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const description = typeof data.description === "string" ? data.description.trim() : "";
  const images = parseImages(data.images, userId);
  const price = Number(data.price);
  const stock = Number(data.stock);

  if (
    !name ||
    name.length > NAME_MAX_LENGTH ||
    !description ||
    description.length > DESCRIPTION_MAX_LENGTH ||
    !images ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    return null;
  }

  return { name, description, images, price, stock };
}
