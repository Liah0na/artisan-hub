import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import ProductsTable from "@/components/layout/dashboard/ProductsTable";

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);
  const products = session?.user?.id ? await prisma.product.findMany({ where: { artisanId: session.user.id }, orderBy: { createdAt: "desc" } }) : [];

  return <div className="max-w-5xl"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-medium text-gray-500">Sua vitrine</p><h1 className="mt-1 text-3xl font-bold">Meus produtos</h1></div><Link href="/dashboard/products/create" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white">Criar produto</Link></div><ProductsTable products={products} /></div>;
}
