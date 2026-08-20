"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Product = { id: string; name: string; price: number; stock: number };

export default function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function deleteProduct(id: string) {
    if (!window.confirm("Deseja excluir este produto? Esta ação não pode ser desfeita.")) return;
    setDeletingId(id);
    const response = await fetch(`/api/dashboard/products/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (response.ok) router.refresh();
  }

  if (!products.length) {
    return <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">Você ainda não criou nenhum produto.</div>;
  }

  return (
    <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-600"><tr><th className="px-5 py-3 font-medium">Produto</th><th className="px-5 py-3 font-medium">Preço</th><th className="px-5 py-3 font-medium">Estoque</th><th className="px-5 py-3" /></tr></thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-5 py-4 font-medium text-gray-900">{product.name}</td>
              <td className="px-5 py-4">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price)}</td>
              <td className="px-5 py-4">{product.stock}</td>
              <td className="px-5 py-4 text-right"><Link href={`/dashboard/products/${product.id}/edit`} className="mr-4 font-medium text-gray-900 underline">Editar</Link><button type="button" disabled={deletingId === product.id} onClick={() => deleteProduct(product.id)} className="font-medium text-red-700 underline disabled:opacity-60">{deletingId === product.id ? "Excluindo..." : "Excluir"}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
