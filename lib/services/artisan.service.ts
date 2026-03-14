import { artisans } from "@/lib/data/artisans";
import { buildCloudinaryUrl } from "@/lib/utils/cloudinary";

export async function getArtisanById(id: string) {
  const artisan = artisans.find(a => a.id === id);
  if (artisan && artisan.avatar) {
    artisan.avatar = buildCloudinaryUrl(artisan.avatar, 1000);
  }

  return artisan;
};