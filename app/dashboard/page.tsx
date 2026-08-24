import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/signin");
  }

  const totalProducts = await prisma.product.count({ where: { artisanId: session.user.id } });
  const activeProducts = await prisma.product.count({ where: { artisanId: session.user.id, stock: { gt: 0 } } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">
        Olá, {session.user.name || "artesão"}!
      </h1>

      <p className="mb-6 text-gray-600">
        Este é o painel da sua conta no Artisan Hub.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-white p-4 rounded shadow">
          <p>Total de produtos</p>
          <h2 className="text-xl font-bold">{totalProducts}</h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p>Produtos ativos</p>
          <h2 className="text-xl font-bold">{activeProducts}</h2>
        </div>
      </div>

      <section className="mt-6 rounded-lg bg-white p-5 shadow">
        <h2 className="text-lg font-semibold">Sua conta</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="font-medium">E-mail:</dt>
            <dd>{session.user.email}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium">Perfil:</dt>
            <dd>{session.user.role === "admin" ? "Administrador" : "Artesão"}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
};

export default DashboardPage;
