"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_IMAGES = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = /^image\/(jpeg|png|webp)$/;

type ImageItem =
  | { key: string; kind: "existing"; url: string }
  | { key: string; kind: "new"; file: File; previewUrl: string };

type ProductFormProps = {
  product?: {
    id: string;
    name: string;
    description: string;
    images: string[];
    price: number;
    stock: number;
  };
};

function makeKey() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [images, setImages] = useState<ImageItem[]>(
    () => (product?.images ?? []).map((url) => ({ key: makeKey(), kind: "existing" as const, url }))
  );
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [stock, setStock] = useState(product?.stock?.toString() ?? "0");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Revoke object URLs created for local previews when they're no longer needed.
  useEffect(() => {
    return () => {
      images.forEach((item) => {
        if (item.kind === "new") URL.revokeObjectURL(item.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/dashboard/uploads/product-image", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Não foi possível enviar a imagem.");
    }

    return data.url as string;
  }

  function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      setError(`Você pode ter no máximo ${MAX_IMAGES} imagens por produto.`);
      event.target.value = "";
      return;
    }

    const accepted: ImageItem[] = [];
    let localError = "";

    for (const file of files) {
      if (accepted.length >= remainingSlots) {
        localError = `Apenas as primeiras ${remainingSlots} imagens foram adicionadas (limite de ${MAX_IMAGES}).`;
        break;
      }
      if (!ACCEPTED_TYPES.test(file.type)) {
        localError = "Use imagens JPG, PNG ou WebP.";
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        localError = "Cada imagem deve ter no máximo 5 MB.";
        continue;
      }
      accepted.push({ key: makeKey(), kind: "new", file, previewUrl: URL.createObjectURL(file) });
    }

    setError(localError);
    if (accepted.length) setImages((prev) => [...prev, ...accepted]);
    event.target.value = "";
  }

  function removeImage(key: string) {
    setImages((prev) => {
      const target = prev.find((item) => item.key === key);
      if (target?.kind === "new") URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.key !== key);
    });
  }

  function makeCover(key: string) {
    setImages((prev) => {
      const index = prev.findIndex((item) => item.key === key);
      if (index <= 0) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (images.length === 0) {
      setError("Adicione ao menos uma imagem. Ela será a imagem principal exibida no catálogo.");
      return;
    }

    setLoading(true);

    try {
      const finalImages: string[] = [];
      for (const item of images) {
        if (item.kind === "existing") {
          finalImages.push(item.url);
        } else {
          const url = await uploadImage(item.file);
          finalImages.push(url);
        }
      }

      const response = await fetch(
        product ? `/api/dashboard/products/${product.id}` : "/api/dashboard/products",
        {
          method: product ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description, images: finalImages, price, stock }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Não foi possível salvar o produto.");
        return;
      }

      router.push("/dashboard/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível conectar ao servidor. Tente novamente.");
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
        <label htmlFor="images" className="mb-2 block text-sm font-medium">
          Imagens do produto <span className="text-red-600">*</span> ({images.length}/{MAX_IMAGES})
        </label>
        <input
          ref={fileInputRef}
          id="images"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFilesChange}
          disabled={images.length >= MAX_IMAGES}
          required={images.length === 0}
          className="w-full rounded-md border px-3 py-2 file:mr-4 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium disabled:opacity-50"
        />
        <p className="mt-2 text-xs text-gray-500">
          JPG, PNG ou WebP. Máximo de 5 MB por imagem e {MAX_IMAGES} imagens no total. É obrigatório ao menos 1 imagem — a primeira é usada como imagem principal (capa) exibida no catálogo.
        </p>

        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map((item, index) => {
              const src = item.kind === "existing" ? item.url : item.previewUrl;
              return (
                <div key={item.key} className="group relative aspect-square overflow-hidden rounded-md border bg-gray-50">
                  <Image src={src} alt={`Imagem ${index + 1} do produto`} fill unoptimized className="object-cover" />
                  {index === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-gray-900/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      Capa
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => makeCover(item.key)}
                        className="rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-gray-900"
                      >
                        Tornar capa
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(item.key)}
                      className="ml-auto rounded bg-red-600/90 px-1.5 py-0.5 text-[10px] font-medium text-white"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
