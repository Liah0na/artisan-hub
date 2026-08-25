import Header from '@/components/layout/landing-page/Header';
import Footer from '@/components/layout/landing-page/Footer';
import Container from '@/components/ui/Container';
import ProductCard from '@/components/ui/ProductCard';
import { getAllProducts } from '@/lib/services/product.service';

export const metadata = {
  title: 'Produtos | Artisan Hub',
  description: 'Todas as peças feitas à mão pelos artesãos do Artisan Hub.',
};

export default async function ProductsPage() {
  const productList = await getAllProducts();

  return (
    <>
      <Header />

      <section className="w-full py-16">
        <Container>
          <header className="mx-auto mb-14 max-w-xl text-center">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--color-secondary)]">
              Catálogo completo
            </span>
            <h1 className="font-secondary mt-3 text-4xl font-semibold sm:text-5xl">
              Todos os produtos
            </h1>
            <p className="mt-4 text-black/60">
              {productList.length > 0
                ? `${productList.length} ${productList.length === 1 ? 'peça disponível' : 'peças disponíveis'}, feitas à mão por artesãos de Niterói e região.`
                : 'Peças exclusivas, feitas à mão por artesãos de Niterói e região.'}
            </p>
          </header>

          {productList.length === 0 ? (
            <p className="text-center text-black/50">
              Ainda não há produtos cadastrados. Volte em breve!
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {productList.map((product) => {
                if (!product) return null;
                return <ProductCard key={product.id} product={product} />;
              })}
            </div>
          )}
        </Container>
      </section>

      <Footer />
    </>
  );
}
