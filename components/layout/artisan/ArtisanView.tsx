import ArtisanProfile from '@/components/layout/artisan/ArtisanProfile';
import { getArtisanById } from '@/lib/services/artisan.service';
import { getProductsByArtisanId } from '@/lib/services/product.service';

type Props = {
    id: string;
};

const ArtisanView = async ({ id }: Props) => {
  const artisan = await getArtisanById(id);

  if (!artisan) return <div>Not found</div>;

  const products = await getProductsByArtisanId(id);

  return (
    <ArtisanProfile artisan={artisan} products={products} />
  );
}

export default ArtisanView;