import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions);

  const [artisanCount, productCount, messageCount, unreadCount] = await Promise.all([
    prisma.user.count({ where: { role: "artisan" } }),
    prisma.product.count(),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { read: false } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Olá, {session?.user?.name || "admin"}!</h1>
      <p className="mb-6 mt-2 text-gray-600">Este é o painel administrativo do Artisan Hub.</p>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/admin/artisans" className="rounded-xl bg-white p-4 shadow ring-1 ring-transparent transition hover:ring-gray-200">
          <p className="text-gray-500">Artesãos</p>
          <h2 className="text-2xl font-bold">{artisanCount}</h2>
        </Link>

        <Link href="/admin/products" className="rounded-xl bg-white p-4 shadow ring-1 ring-transparent transition hover:ring-gray-200">
          <p className="text-gray-500">Produtos</p>
          <h2 className="text-2xl font-bold">{productCount}</h2>
        </Link>

        <Link href="/admin/messages" className="rounded-xl bg-white p-4 shadow ring-1 ring-transparent transition hover:ring-gray-200">
          <p className="text-gray-500">Mensagens de contato</p>
          <h2 className="text-2xl font-bold">
            {messageCount}
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-sm font-medium text-red-700">
                {unreadCount} não lida{unreadCount > 1 ? "s" : ""}
              </span>
            )}
          </h2>
        </Link>
      </div>
    </div>
  );
}
