import { galleries } from '@/lib/data/galleries';
import { reviews } from '@/lib/data/reviews';
import { products } from '@/lib/data/products';

export async function getProductFullById(id: string) {
  const product = products.find(p => p.id === id);
  if (!product) return null;

  const gallery = galleries.filter(g => g.productId === id);
  const productReviews = reviews.filter(r => r.productId === id);

  return {
    ...product,
    gallery,
    reviews: productReviews,
  };
}