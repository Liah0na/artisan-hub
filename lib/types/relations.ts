import { Product } from '@/lib/types/product';
import { Artisan } from '@/lib/types/artisan';

export type ProductWithArtisan = Product & {
  artisan: Artisan | null;
};

export type ProductDetail = Product & {
  artisan: Artisan | null;
  relatedProducts: Product[];
};
