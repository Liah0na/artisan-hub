import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import AdminsManager from "@/components/layout/admin/AdminsManager";

export default async function AdminAdminsPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "superadmin") redirect("/admin");

  // Filtro explícito por role "admin": isso já garante que o próprio
  // super usuário nunca aparece nesta lista.
  const admins = await prisma.user.findMany({
    where: { role: "admin" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return (
    <div>
      <p className="text-sm font-medium text-gray-500">Painel administrativo</p>
      <h1 className="mt-1 text-3xl font-bold">Administradores</h1>
      <p className="mt-1 text-gray-600">Crie ou remova contas com acesso ao painel administrativo.</p>

      <AdminsManager admins={admins.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }))} />
    </div>
  );
}
