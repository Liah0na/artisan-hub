import UserCard from "@/components/layout/dashboard/UserCard";
import { getArtisanById } from "@/lib/services/artisan.service";

type Props = {
  id?: string;
};

const DashboardPage = async ({ id }: Props) => {
  const artisanId = id || "art-001";
  const artisan = (await getArtisanById(artisanId)) || null;

  return (
     <div>
      <h1 className="text-2xl font-bold mb-6">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <p>Total Products</p>
          <h2 className="text-xl font-bold">0</h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p>Active Products</p>
          <h2 className="text-xl font-bold">0</h2>
        </div>
      </div>

      <UserCard user={artisan} />
    </div>
  )
};

export default DashboardPage;