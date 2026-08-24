import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/layout/dashboard/ProfileForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/signin");

  const products = await prisma.product.findMany({
    where: { artisanId: user.id },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: { id: true, name: true, images: true, price: true },
  });
  const productCount = await prisma.product.count({ where: { artisanId: user.id } });

  return (
    <div>
      <p className="text-sm font-medium text-gray-500">Sua vitrine</p>
      <h1 className="mt-1 text-3xl font-bold">Perfil do artesão</h1>

      <ProfileForm
        profile={{
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          phone: user.phone,
          instagram: user.instagram,
          location: user.location,
        }}
      />

      <section className="mt-8 max-w-2xl rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Seus produtos</h2>
          <span className="text-sm text-gray-500">{productCount} no total</span>
        </div>

        {products.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            Você ainda não criou nenhum produto.{" "}
            <Link href="/dashboard/products/create" className="font-medium text-gray-900 underline">
              Criar o primeiro produto
            </Link>
          </p>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/dashboard/products/${product.id}/edit`}
                  className="group overflow-hidden rounded-lg border"
                >
                  <div className="relative aspect-square bg-gray-50">
                    {product.images[0] ? (
                      <Image src={product.images[0]} alt={product.name} fill unoptimized className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">Sem imagem</div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="truncate text-sm font-medium group-hover:underline">{product.name}</p>
                    <p className="text-xs text-gray-500">R$ {product.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/dashboard/products" className="mt-4 inline-block text-sm font-medium text-gray-900 underline">
              Ver todos os produtos
            </Link>
          </>
        )}
      </section>
    </div>
  );
}
