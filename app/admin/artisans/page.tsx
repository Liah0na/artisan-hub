import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminArtisansPage() {
  const artisans = await prisma.user.findMany({
    where: { role: "artisan" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <p className="text-sm font-medium text-gray-500">Painel administrativo</p>
      <h1 className="mt-1 text-3xl font-bold">Artesãos</h1>

      {artisans.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
          Nenhum artesão cadastrado ainda.
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="px-5 py-3 font-medium">E-mail</th>
                <th className="px-5 py-3 font-medium">Localização</th>
                <th className="px-5 py-3 font-medium">Produtos</th>
                <th className="px-5 py-3 font-medium">Cadastro</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {artisans.map((artisan) => (
                <tr key={artisan.id}>
                  <td className="px-5 py-4 font-medium text-gray-900">{artisan.name}</td>
                  <td className="px-5 py-4">{artisan.email}</td>
                  <td className="px-5 py-4">{artisan.location || "—"}</td>
                  <td className="px-5 py-4">{artisan._count.products}</td>
                  <td className="px-5 py-4">
                    {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(artisan.createdAt)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/artisan/${artisan.id}`} target="_blank" className="font-medium text-gray-900 underline">
                      Ver perfil
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
