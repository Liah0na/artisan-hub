"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ModeratedProduct = {
  id: string;
  name: string;
  artisanName: string;
  price: number;
  stock: number;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  thumbnail: string | null;
};

const STATUS_LABEL: Record<ModeratedProduct["status"], string> = {
  pending: "Em análise",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

const STATUS_STYLE: Record<ModeratedProduct["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-700",
};

export default function ProductModerationTable({ products }: { products: ModeratedProduct[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function updateStatus(id: string, status: "approved" | "rejected", rejectionReason?: string) {
    setBusyId(id);
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, rejectionReason }),
    });
    setBusyId(null);
    router.refresh();
  }

  function handleReject(id: string) {
    const reason = window.prompt("Motivo da rejeição (o artesão vai ver esta mensagem):");
    if (!reason || !reason.trim()) return;
    updateStatus(id, "rejected", reason.trim());
  }

  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  if (!products.length) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
        Nenhum produto cadastrado ainda.
      </div>
    );
  }

  return (
    <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-5 py-3 font-medium" />
            <th className="px-5 py-3 font-medium">Produto</th>
            <th className="px-5 py-3 font-medium">Artesão</th>
            <th className="px-5 py-3 font-medium">Preço</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-5 py-3">
                <div className="h-12 w-12 overflow-hidden rounded-md bg-gray-100">
                  {product.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover" />
                  )}
                </div>
              </td>
              <td className="px-5 py-4 font-medium text-gray-900">{product.name}</td>
              <td className="px-5 py-4">{product.artisanName}</td>
              <td className="px-5 py-4">{currency.format(product.price)}</td>
              <td className="px-5 py-4">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[product.status]}`}>
                  {STATUS_LABEL[product.status]}
                </span>
                {product.status === "rejected" && product.rejectionReason && (
                  <p className="mt-1 max-w-[220px] text-xs text-gray-500">{product.rejectionReason}</p>
                )}
              </td>
              <td className="px-5 py-4 text-right">
                <div className="flex justify-end gap-4">
                  {product.status !== "approved" && (
                    <button
                      type="button"
                      disabled={busyId === product.id}
                      onClick={() => updateStatus(product.id, "approved")}
                      className="font-medium text-green-700 underline disabled:opacity-60"
                    >
                      Aprovar
                    </button>
                  )}
                  {product.status !== "rejected" && (
                    <button
                      type="button"
                      disabled={busyId === product.id}
                      onClick={() => handleReject(product.id)}
                      className="font-medium text-red-700 underline disabled:opacity-60"
                    >
                      Rejeitar
                    </button>
                  )}
                  {product.status === "approved" && (
                    <a
                      href={`/product/${product.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-gray-900 underline"
                    >
                      Ver produto
                    </a>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
