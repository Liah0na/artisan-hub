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
  images: string[];
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

function ImageReviewModal({
  product,
  busy,
  onClose,
  onApprove,
  onReject,
}: {
  product: ModeratedProduct;
  busy: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{product.name}</h2>
            <p className="text-sm text-gray-500">
              {product.artisanName} · {product.images.length}{" "}
              {product.images.length === 1 ? "imagem" : "imagens"}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Fechar">
            ✕
          </button>
        </div>

        {product.images.length === 0 ? (
          <p className="mt-6 text-sm text-gray-500">Este produto não tem imagens.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {product.images.map((src, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt={`${product.name} — imagem ${index + 1}`}
                className="aspect-square w-full rounded-lg border border-gray-200 object-cover"
              />
            ))}
          </div>
        )}

        {product.status === "rejected" && product.rejectionReason && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            Motivo da rejeição: {product.rejectionReason}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
          {product.status !== "rejected" && (
            <button
              type="button"
              disabled={busy}
              onClick={onReject}
              className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-60"
            >
              Rejeitar
            </button>
          )}
          {product.status !== "approved" && (
            <button
              type="button"
              disabled={busy}
              onClick={onApprove}
              className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              Aprovar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductModerationTable({ products }: { products: ModeratedProduct[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const previewProduct = products.find((p) => p.id === previewId) ?? null;

  async function updateStatus(id: string, status: "approved" | "rejected", rejectionReason?: string) {
    setBusyId(id);
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, rejectionReason }),
    });
    setBusyId(null);
    setPreviewId(null);
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
    <>
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
                  <button
                    type="button"
                    onClick={() => setPreviewId(product.id)}
                    className="group relative block h-12 w-12 overflow-hidden rounded-md bg-gray-100"
                    title="Ver todas as imagens"
                  >
                    {product.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition group-hover:opacity-75"
                      />
                    )}
                    {product.images.length > 1 && (
                      <span className="absolute bottom-0 right-0 rounded-tl bg-black/70 px-1 text-[10px] font-medium text-white">
                        +{product.images.length - 1}
                      </span>
                    )}
                  </button>
                </td>
                <td className="px-5 py-4 font-medium text-gray-900">
                  <button type="button" onClick={() => setPreviewId(product.id)} className="text-left hover:underline">
                    {product.name}
                  </button>
                  <p className="text-xs font-normal text-gray-400">
                    {product.images.length} {product.images.length === 1 ? "imagem" : "imagens"}
                  </p>
                </td>
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
                    <button
                      type="button"
                      onClick={() => setPreviewId(product.id)}
                      className="font-medium text-gray-900 underline"
                    >
                      Ver imagens
                    </button>
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

      {previewProduct && (
        <ImageReviewModal
          product={previewProduct}
          busy={busyId === previewProduct.id}
          onClose={() => setPreviewId(null)}
          onApprove={() => updateStatus(previewProduct.id, "approved")}
          onReject={() => handleReject(previewProduct.id)}
        />
      )}
    </>
  );
}
