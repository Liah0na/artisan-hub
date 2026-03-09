import { Product } from '@/lib/types/product';
import { Artisan } from '@/lib/types/artisan';
import { Gallery } from '@/lib/types/gallery';

export type ProductWithArtisan = Product & {
  artisan: Artisan | null;
};

export type ProductWithGallery = Product & {
  gallery: Gallery[];
};

export type ProductDetail = Product & {
  artisan: Artisan | null;
  gallery: Gallery[];
  relatedProducts: Product[];
};