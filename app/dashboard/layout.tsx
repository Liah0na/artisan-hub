import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import SignOutButton from "@/components/auth/SignOutButton";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-gray-900 p-4 text-white">
        <Image src="/artisanHub-w.svg" alt="Artisan Hub Logo" width={245} height={55} sizes="245px" />

        <hr className="my-4 border-gray-300" />

        <nav className="flex flex-col gap-3">
          <Link href="/dashboard">Visão geral</Link>
          <Link href="/dashboard/products">Produtos</Link>
          <Link href="/dashboard/products/create">Criar produto</Link>
          <Link href="/dashboard/profile">Perfil</Link>
        </nav>

        <div className="mt-auto pt-10 text-sm text-gray-300">
          <p className="mb-3 truncate">{session.user.email}</p>
          <SignOutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-50">
        {children}
      </main>
    </div>
  )
};

export default DashboardLayout;
