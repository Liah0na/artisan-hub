import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import SignOutButton from "@/components/auth/SignOutButton";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/signin");
  if (session.user.role !== "admin" && session.user.role !== "superadmin") redirect("/dashboard");

  const isSuperAdmin = session.user.role === "superadmin";

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col bg-gray-900 p-4 text-white">
        <Image src="/artisanHub-w.svg" alt="Artisan Hub Logo" width={245} height={55} sizes="245px" />

        <hr className="my-4 border-gray-300" />

        <nav className="flex flex-col gap-3">
          <Link href="/admin">Visão geral</Link>
          <Link href="/admin/messages">Mensagens</Link>
          <Link href="/admin/artisans">Artesãos</Link>
          <Link href="/admin/products">Produtos</Link>
          {isSuperAdmin && <Link href="/admin/admins">Administradores</Link>}
        </nav>

        <div className="mt-auto pt-10 text-sm text-gray-300">
          <p className="mb-1 truncate">{session.user.email}</p>
          <p className="mb-3 text-xs uppercase tracking-wide text-gray-400">
            {isSuperAdmin ? "Super administrador" : "Administrador"}
          </p>
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 bg-gray-50 p-6">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
