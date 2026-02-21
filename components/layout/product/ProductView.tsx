import Image from 'next/image';
import { Product, Gallery } from '@/lib/types';
import Header from '@/components/layout/landing-page/Header';
import Footer from '@/components/layout/landing-page/Footer';

interface ProductWithGallery extends Product {
  gallery: Gallery[];
}

interface Props {
  product: ProductWithGallery;
}

export default function ProductView({ product }: Props) {
  const mainImage = product.gallery?.[0]?.url ?? '/default.jpg';

  return (
    <>
      <Header />

      <div className="mx-auto max-w-[1200px] px-6 py-24">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-2xl">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              priority
              className="object-cover"
            />
          </div>

          <div>
            <h1 className="mb-4 text-3xl font-bold">{product.name}</h1>
            <p className="mb-4 text-lg text-gray-600">
              ${product.price.toFixed(2)}
            </p>
            <p className="mb-6 text-gray-700">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}