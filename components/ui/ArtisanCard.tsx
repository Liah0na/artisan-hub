import Image from 'next/image';

type ArtisanCardProps = {
  name?: string;
  role?: string;
  description?: string;
  imageUrl?: string;
};

const ArtisanCard = ({
  name = 'Artesano Anónimo',
  role = 'Artesano',
  description = 'Un talentoso artesano con habilidades únicas y pasión por su oficio.',
  imageUrl = '/default.jpg',
}: ArtisanCardProps) => {
  return (
    <div className="flex flex-col items-center text-center rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="relative mb-4 h-24 w-24">
        <Image
          src={imageUrl}
          alt={name}
          className="rounded-full object-cover"
          fill
        />
      </div>

      <h3 className="text-lg font-semibold">{name}</h3>
      <span className="mb-2 text-sm text-black/60">{role}</span>

      <p className="text-sm leading-relaxed text-black/70">
        {description}
      </p>
    </div>
  );
}

export default ArtisanCard;