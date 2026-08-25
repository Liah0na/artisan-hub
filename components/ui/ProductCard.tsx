import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { buildCloudinaryUrl } from '@/lib/utils/cloudinary';

interface ProductCardProps {
  product: Product;
}

const priceFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const ProductCard = ({ product }: ProductCardProps) => {
  const mainImage = buildCloudinaryUrl(product.images?.[0] ?? '', 800);

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white
        ring-1 ring-black/5 transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-xl hover:ring-black/10"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="h-full w-full object-cover
            transition-transform duration-500 ease-out
            group-hover:scale-105"
        />
        <span
          className="absolute left-3 top-3 rounded-full bg-[color:var(--color-navbar)]/90 px-3 py-1
            text-[11px] font-medium uppercase tracking-wide text-black/70 backdrop-blur-sm"
        >
          Peça artesanal
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-medium tracking-tight transition-colors duration-300 group-hover:text-black">
          {product.name}
        </h3>

        <p className="mt-1 line-clamp-3 flex-1 text-sm text-black/60">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
          <span className="text-base font-semibold">
            {priceFormatter.format(product.price)}
          </span>

          <Link
            href={`/product/${product.id || 0}`}
            className="inline-flex items-center text-sm font-medium text-black/70
              transition-all duration-300 group-hover:gap-2 group-hover:text-black"
          >
            Ver produto
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
