import Image from 'next/image';

type ProductCardProps = {
  imageSrc?: string;
  altText?: string; 
  title?: string;
  description?: string;
};

const ProductCard = ({
  imageSrc = '/default.jpg',
  altText = 'Producto artesanal',
  title = 'Producto artesanal',
  description = 'Hecho a mano en Brasil',
}: ProductCardProps) => {
  return (
    <article
      className="group relative rounded-2xl border border-primary bg-white p-2
            transition-all duration-300 ease-out
            hover:-translate-y-1
            hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]
            hover:border-black/20"
    >
      <div className="relative h-48 w-full overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={imageSrc}
          alt={altText}
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
          {title}
        </h3>

        <p className="mt-1 text-sm text-black/60">
          {description}
        </p>
      </div>

      {/*<!-- CTA sutil -->*/}
      <div className="mt-4">
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
      </div>
    </article>
  );
};

export default ProductCard;