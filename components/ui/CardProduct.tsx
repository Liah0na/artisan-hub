import Image from "next/image";

const CardProduct = () => {
  return (
    <article
      className="group relative rounded-2xl border border-black/10 bg-white p-4
            transition-all duration-300 ease-out
            hover:-translate-y-1
            hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]
            hover:border-black/20"
    >
      {/*<!-- Imagen -->*/}
      <div className="relative h-48 w-full overflow-hidden rounded-xl bg-gray-100">
        <Image
          src="/default.jpg"
          alt="Producto artesanal"
          className="h-full w-full object-cover
                transition-transform duration-500 ease-out
                group-hover:scale-105"
          fill
        />
      </div>

      {/*<!-- Contenido -->*/}
      <div className="mt-4">
        <h3
          className="text-lg font-medium tracking-tight
                transition-colors duration-300
                group-hover:text-black"
        >
          Producto artesanal
        </h3>

        <p className="mt-1 text-sm text-black/60">
          Hecho a mano en Brasil
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
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </article>
  );
};

export default CardProduct;