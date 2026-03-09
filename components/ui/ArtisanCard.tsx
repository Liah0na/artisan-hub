import { Artisan } from '@/lib/types/artisan';
import Image from 'next/image';
import Link from 'next/link';

interface ArtisanCardProps {
  artisan?: Artisan | null;
};

const ArtisanCard = ({ artisan }: ArtisanCardProps) => {

  if (!artisan) return null;
  
  return (
    <div className="mt-8 border rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition">

  <Image
    src={artisan.avatar || "/default.jpg"}
    alt={artisan.name}
    width={56}
    height={56}
    className="rounded-full object-cover"
  />

  <div className="flex flex-col">

    <Link
      href={`/artisan/${artisan.id}`}
      className="font-semibold text-lg hover:text-primary"
    >
      {artisan.name}
    </Link>

    <p className="text-sm text-gray-500 line-clamp-2">
      {artisan.bio}
    </p>

    <span className="text-xs text-gray-400">
      ⭐ {artisan.rating}
    </span>

  </div>

</div>
  );
}

export default ArtisanCard;