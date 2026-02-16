import Container from "@/components/ui/Container";

const News = () => {
  return (
    <div className="background-primary">
      <Container className="py-8">
        <h2 className="font-secondary mb-4 text-3xl font-semibold text-center text-white">
          Noticias Recientes
        </h2>
        <p className="text-center text-white">
          Mantente al día con las últimas novedades y eventos en el mundo del arte y la artesanía.
        </p>
      </Container>
    </div>
  );
}

export default News;