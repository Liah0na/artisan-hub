import { notFound } from 'next/navigation';
import ArtisanView from '@/components/layout/artisan/ArtisanView';
import { getArtisanById } from '@/lib/services/artisan.service';

type PageProps = {
  params: {
    id: string;
  };
};

export default async function ArtisanPage({ params }: PageProps) {
  const artisan = await getArtisanById(params.id);

  if (!artisan) return notFound();

  return <ArtisanView id={params.id} />
}