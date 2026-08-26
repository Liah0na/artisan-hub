import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { artisan: { select: { name: true } } },
  });

  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div>
      <p className="text-sm font-medium text-gray-500">Painel administrativo</p>
      <h1 className="mt-1 text-3xl font-bold">Produtos</h1>

      {products.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
          Nenhum produto cadastrado ainda.
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-5 py-3 font-medium">Produto</th>
                <th className="px-5 py-3 font-medium">Artesão</th>
                <th className="px-5 py-3 font-medium">Preço</th>
                <th className="px-5 py-3 font-medium">Estoque</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-5 py-4 font-medium text-gray-900">{product.name}</td>
                  <td className="px-5 py-4">{product.artisan?.name ?? "—"}</td>
                  <td className="px-5 py-4">{currency.format(product.price)}</td>
                  <td className="px-5 py-4">{product.stock}</td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/product/${product.id}`} target="_blank" className="font-medium text-gray-900 underline">
                      Ver produto
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
