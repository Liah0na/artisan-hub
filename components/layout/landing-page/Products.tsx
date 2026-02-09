import CardProduct from "@/components/ui/CardProduct";

const Products = () => {
  return (
    <section className="w-full py-16">
      <div className="mx-auto max-w-[1200px] px-4">
        <h2 className="font-secondary mb-10 text-3xl font-semibold text-center">
          Productos destacados
        </h2>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          
          <CardProduct />
          <CardProduct
            imageSrc="/dolls.jpg"
            title="Otro producto artesanal"
          />
          <CardProduct
            imageSrc="/painting.jpg"
            title="Pintura al óleo"
          />
          <CardProduct
            imageSrc="/carlabron.jpg"
            title="Pintura al óleo"
          />
          <CardProduct
            imageSrc="/wood.jpg"
            title="Pintura al óleo"
          />
          <CardProduct
            imageSrc="/notebook.jpg"
            title="Pintura al óleo"
          />
          <CardProduct
            imageSrc="/mandala.jpg"
            title="Lorem ipsum dolor sit amet"
          />
          <CardProduct
            imageSrc="/street-art.jpg"
            title="Consectetur adipiscing elit"
          />

        </div>

      </div>
    </section>
  );
}

export default Products;