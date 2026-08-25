import ProductCard from '@/components/ui/ProductCard';
import { getAllProducts } from '@/lib/services/product.service';

const ProductsSection = async () => {
  const productList = await getAllProducts();

  return (
    <section className="w-full py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <header className="mx-auto mb-14 max-w-xl text-center">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--color-secondary)]">
            Coleção atual
          </span>
          <h2 className="font-secondary mt-3 text-4xl font-semibold sm:text-5xl">
            Produtos em destaque
          </h2>
          <p className="mt-4 text-black/60">
            Peças exclusivas, feitas à mão por artesãos de Niterói e região.
          </p>
        </header>

        {productList.length === 0 ? (
          <p className="text-center text-black/50">
            Em breve, novidades por aqui.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {productList.map((product) => {
              if (!product) return null;
              return <ProductCard key={product.id} product={product} />;
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
