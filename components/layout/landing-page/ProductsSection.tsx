import { products } from '@/lib/data/products';
import ProductCard from '@/components/ui/ProductCard';

const ProductsSection = () => {
  return (
    <section className="w-full py-16">
      <div className="mx-auto max-w-[1200px] px-4">
        <h2 className="font-secondary mb-10 text-3xl font-semibold text-center">
          Productos destacados
        </h2>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))             
          }
        </div>

      </div>
    </section>
  );
}

export default ProductsSection;