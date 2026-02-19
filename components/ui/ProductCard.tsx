import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';

interface ProductCardProps { product: Product; }

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <article
      className="group relative rounded-2xl bg-white
            transition-all duration-300 ease-out
            hover:-translate-y-1"
    >
      <div className="relative h-48 w-full overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={product.image || '/default.jpg'}
          alt={product.name}
          className="h-full w-full object-cover
                transition-transform duration-500 ease-out
                group-hover:scale-105"
          fill
        />
      </div>

      <div className="mt-4">
        <h3
          className="text-lg font-medium tracking-tight
                transition-colors duration-300
                group-hover:text-black"
        >
          {product.name}
        </h3>

        <p className="mt-1 text-sm text-black/60">
          {product.description}
        </p>
      </div>

      <div className="mt-4">
        <Link href={`/product/${product.id || 0}`} className="inline-flex items-center text-sm font-medium text-black/70">
        <span
          className="inline-flex items-center text-sm font-medium text-black/70
                transition-all duration-300
                group-hover:text-black
                group-hover:gap-2"
        >
          Ver producto
          <svg
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
        </Link>
      </div>
    </article>
  );
};

export default ProductCard;