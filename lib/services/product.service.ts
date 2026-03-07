import { galleries } from '@/lib/data/galleries';
import { reviews } from '@/lib/data/reviews';
import { products } from '@/lib/data/products';
import { buildCloudinaryUrl } from '@/lib/utils/cloudinary';

export async function getProductFullById(id: string) {
  const product = products.find(p => p.id === id);
  if (!product) return null;

  const gallery = galleries.filter(g => g.productId === id);
  const productReviews = reviews.filter(r => r.productId === id);
  const relatedProducts = products
    .filter(p => p.artisanId === product.artisanId && p.id !== id)
    .slice(0, 4);

  return {
    ...product,
    mainImage: buildCloudinaryUrl(product.mainImage, 1000),
    gallery: gallery.map(g => ({
      ...g,
      url: buildCloudinaryUrl(g.url, 1000),
    })),
    reviews: productReviews,
    relatedProducts,
  };
}

export async function getAllProductsFull() {
  return products.map(product => {
    const gallery = galleries.filter(g => g.productId === product.id);
    const productReviews = reviews.filter(r => r.productId === product.id);

    return {
      ...product,
      gallery,
      reviews: productReviews,
    };
  });
}