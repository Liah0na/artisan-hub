import Image from 'next/image';
import { Gallery, Product } from '@/lib/types';
import Header from '@/components/layout/landing-page/Header';
import Footer from '@/components/layout/landing-page/Footer';
import ProductCard from '@/components/ui/ProductCard';
import Container from '@/components/ui/Container';

interface ProductDetail extends Product {
  gallery: Gallery[];
  relatedProducts: Product[];
}

interface Props {
  product: ProductDetail;
}

export default function ProductView({ product }: Props) {
  const mainImage = product.gallery?.[0]?.url ?? '/default.jpg';

  return (
    <>
      <Header />

      <Container className="py-8">
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
      </Container>

      <Container className="mb-2 mt-2">
        {product.relatedProducts.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-6">
              More from this artisan
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.relatedProducts.map(related => (
                <ProductCard
                  key={related.id}
                  product={related}
                />
              ))}
            </div>
          </div>
        )}
      </Container>

      <Footer />
    </>
  );
}