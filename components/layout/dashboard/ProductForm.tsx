"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type ProductFormProps = {
  product?: {
    id: string;
    name: string;
    description: string;
    mainImage: string | null;
    price: number;
    stock: number;
  };
};

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [mainImage, setMainImage] = useState(product?.mainImage ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [stock, setStock] = useState(product?.stock?.toString() ?? "0");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        product ? `/api/dashboard/products/${product.id}` : "/api/dashboard/products",
        {
          method: product ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description, mainImage, price, stock }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Não foi possível salvar o produto.");
        return;
      }

      router.push("/dashboard/products");
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium">Nome do produto</label>
        <input id="name" value={name} onChange={(event) => setName(event.target.value)} required className="w-full rounded-md border px-3 py-2" />
      </div>
      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-medium">Descrição</label>
        <textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} required rows={5} className="w-full rounded-md border px-3 py-2" />
      </div>
      <div>
        <label htmlFor="mainImage" className="mb-2 block text-sm font-medium">URL da imagem (opcional)</label>
        <input id="mainImage" type="url" value={mainImage} onChange={(event) => setMainImage(event.target.value)} className="w-full rounded-md border px-3 py-2" placeholder="https://..." />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="mb-2 block text-sm font-medium">Preço (R$)</label>
          <input id="price" type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required className="w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label htmlFor="stock" className="mb-2 block text-sm font-medium">Estoque</label>
          <input id="stock" type="number" min="0" step="1" value={stock} onChange={(event) => setStock(event.target.value)} required className="w-full rounded-md border px-3 py-2" />
        </div>
      </div>
      {error && <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="flex gap-3">
        <button disabled={loading} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
          {loading ? "Salvando..." : product ? "Salvar alterações" : "Criar produto"}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded-md border px-4 py-2 text-sm font-medium">Cancelar</button>
      </div>
    </form>
  );
}
