import ArtisanCard from "@/components/ui/ArtisanCard";

const ArtisansSection = () => {
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
        <ArtisanCard artisan={{
          id: "art-001",
          name: "Elena Otondo Anzoleaga",
          bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
          avatar: "",
          email: "elenita.otondo@gmail.com",
          createdAt: "2026-01-01"
        }} />
      </div>
    </section>
  );
}

export default ArtisansSection;