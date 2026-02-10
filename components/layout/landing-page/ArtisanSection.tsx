import ArtisanCard from "@/components/ui/ArtisanCard";

const ArtisansSection = () => {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-20">
      <header className="mb-12 text-center">
        <h2 className="text-3xl font-semibold">
          Conoce a nuestros artesanos
        </h2>
        <p className="mt-2 text-black/60">
          Personas reales detrás de cada producto hecho a mano
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        <ArtisanCard
          name="María Quispe"
          role="Ceramista"
          description="Especialista en cerámica tradicional andina, con más de 15 años de experiencia."
        />

        <ArtisanCard
          name="João Pereira"
          role="Carpintero"
          description="Creador de piezas únicas en madera reutilizada, combinando diseño y sostenibilidad."
        />

        <ArtisanCard
          name="Ana López"
          role="Textil artesanal"
          description="Trabaja con fibras naturales y técnicas ancestrales para crear tejidos únicos."
        />
      </div>
    </section>
  );
}

export default ArtisansSection;