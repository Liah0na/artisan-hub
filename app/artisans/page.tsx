import Header from '@/components/layout/landing-page/Header';
import Footer from '@/components/layout/landing-page/Footer';
import Container from '@/components/ui/Container';
import ArtisanCard from '@/components/ui/ArtisanCard';
import { getArtisans } from '@/lib/services/artisan.service';

export const metadata = {
  title: 'Artesãos | Artisan Hub',
  description: 'Conheça os artesãos por trás de cada peça do Artisan Hub.',
};

export default async function ArtisansPage() {
  const artisans = await getArtisans();

  return (
    <>
      <Header />

      <section className="w-full py-16">
        <Container>
          <header className="mx-auto mb-14 max-w-xl text-center">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--color-secondary)]">
              Nossa comunidade
            </span>
            <h1 className="font-secondary mt-3 text-4xl font-semibold sm:text-5xl">
              Todos os artesãos
            </h1>
            <p className="mt-4 text-black/60">
              {artisans.length > 0
                ? `${artisans.length} ${artisans.length === 1 ? 'artesão cadastrado' : 'artesãos cadastrados'}, cada um com sua história e sua técnica.`
                : 'Pessoas reais por trás de cada peça feita à mão.'}
            </p>
          </header>

          {artisans.length === 0 ? (
            <p className="text-center text-black/50">
              Ainda não há artesãos cadastrados. Volte em breve!
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {artisans.map((artisan) => (
                <ArtisanCard key={artisan.id} artisan={artisan} />
              ))}
            </div>
          )}
        </Container>
      </section>

      <Footer />
    </>
  );
}
