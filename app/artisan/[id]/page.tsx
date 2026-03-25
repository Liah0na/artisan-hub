import { notFound } from 'next/navigation';
import ArtisanView from '@/components/layout/artisan/ArtisanView';
import { getArtisanById } from '@/lib/services/artisan.service';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ArtisanPage({ params }: PageProps) {
  const artisan = await getArtisanById((await params).id);

  if (!artisan) return notFound();

  return <ArtisanView id={(await params).id} />
}