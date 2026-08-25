import ArtisanCard from "@/components/ui/ArtisanCard";
import { getFeaturedArtisans } from "@/lib/services/artisan.service";

const ArtisansSection = async () => {
  const artisans = await getFeaturedArtisans(4);

  if (artisans.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-20">
      <header className="mb-12 text-center">
        <h2 className="text-3xl font-secondary font-bold">
          Conoce a nuestros artesanos
        </h2>
        <p className="mt-2 text-black/60">
          Personas reales detrás de cada producto hecho a mano
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
