import { prisma } from "@/lib/prisma";
import { buildCloudinaryUrl } from "@/lib/utils/cloudinary";
import ProductModerationTable from "@/components/layout/admin/ProductModerationTable";

const STATUS_ORDER = { pending: 0, rejected: 1, approved: 2 } as const;

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { artisan: { select: { name: true } } },
  });

  const pendingCount = products.filter((p) => p.status === "pending").length;

  const rows = products
    .map((product) => ({
      id: product.id,
      name: product.name,
      artisanName: product.artisan?.name ?? "—",
      price: product.price,
      stock: product.stock,
      status: product.status,
      rejectionReason: product.rejectionReason,
      thumbnail: product.images[0] ? buildCloudinaryUrl(product.images[0].publicId, 200) : null,
    }))
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

  return (
    <div>
      <p className="text-sm font-medium text-gray-500">Painel administrativo</p>
      <h1 className="mt-1 text-3xl font-bold">Produtos</h1>
      <p className="mt-1 text-gray-600">
        Produtos novos ou com imagens alteradas ficam ocultos do catálogo público até serem aprovados.
        {pendingCount > 0 && (
          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            {pendingCount} aguardando revisão
          </span>
        )}
      </p>

      <ProductModerationTable products={rows} />
    </div>
  );
}
