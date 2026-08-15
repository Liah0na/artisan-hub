import Image from "next/image";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4">
        <Image src="/artisanHub-w.svg" alt="Artisan Hub Logo" width={245} height={55} sizes="245px" />

        <hr className="my-4 border-gray-300" />

        <nav className="flex flex-col gap-3">
          <a href="/dashboard">Overview</a>
          <a href="/dashboard/products">Products</a>
          <a href="/dashboard/products/create">Create Product</a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-50">
        {children}
      </main>
    </div>
  )
};

export default DashboardLayout;