import CardProduct from "@/components/ui/CardProduct";

const Products = () => {
  return (
    <section className="w-full py-16">
      <div className="mx-auto max-w-[1200px] px-4">
        <h2 className="font-secondary mb-10 text-3xl font-semibold text-center">
          Productos destacados
        </h2>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          
          <article className="rounded-xl border border-primary p-2">
            <div className="h-48 w-full bg-gray-200 rounded-lg mb-4"></div>
            <h3 className="text-lg font-medium">Producto 1</h3>
            <p className="text-sm text-gray-600">Descripción corta</p>
          </article>
          {/*-- Repite 8 veces --*/}
          <CardProduct />
        </div>

      </div>
    </section>
  );
}

export default Products;