import ArtisanCard from "@/components/ui/ArtisanCard";
import { getArtisans } from "@/lib/services/artisan.service";

const ArtisansSection = async () => {
  const artisans = await getArtisans(4);

  if (artisans.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-24">
      <header className="mx-auto mb-14 max-w-xl text-center">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--color-secondary)]">
          Nossa comunidade
        </span>
        <h2 className="font-secondary mt-3 text-4xl font-semibold sm:text-5xl">
          Conheça os artesãos
        </h2>
        <p className="mt-4 text-black/60">
          Pessoas reais por trás de cada peça feita à mão.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-4">
        {artisans.map((artisan) => (
          <ArtisanCard key={artisan.id} artisan={artisan} />
        ))}
      </div>
    </section>
  );
}

export default ArtisansSection;
