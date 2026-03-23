import { notFound } from "next/navigation";
import ArtisanView from "@/components/layout/artisan/ArtisanView";
import { getArtisanById } from "@/lib/services/artisan.service";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ArtisanPage({ params }: PageProps) {
  const { id } = await params;
  const artisan = await getArtisanById(id);

  if (!artisan) return notFound();

  return <ArtisanView id={id} />
}