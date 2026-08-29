import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/layout/dashboard/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const product = session?.user?.id ? await prisma.product.findFirst({ where: { id, artisanId: session.user.id } }) : null;
  if (!product) notFound();
  return <div><p className="text-sm font-medium text-gray-500">Sua vitrine</p><h1 className="mt-1 text-3xl font-bold">Editar produto</h1><ProductForm product={product} /></div>;
}
