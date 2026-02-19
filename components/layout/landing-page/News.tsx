import Container from "@/components/ui/Container";
import Image from "next/image";

const News = () => {
  return (
    <div className="background-primary">
      <Container className="py-8 flex gap-4">
        <div className="relative z-10 mt-8 w-full">
          <h2 className="font-secondary mb-4 text-3xl font-semibold text-center text-white">
            Noticias Recientes
          </h2>
          <p className="text-center text-white">
            Mantente al día con las últimas novedades y eventos en el mundo del arte y la artesanía.
          </p>
        </div>
        <div className="h-64 relative w-64">
          <Image
            alt="Casa de Artesão"
            className="rounded-lg relative object-cover"
            fill
            src="/casa-artesano.jpg"
          />
        </div>
      </Container>
    </div>
  );
}

export default News;