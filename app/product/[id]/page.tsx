import { notFound } from 'next/navigation';
import ProductView from '@/components/layout/product/ProductView';
import { getProductById } from '@/lib/services/product.service';

type PageProps = {
  params: {
    id: string;
  };
};

export default async function ProductPage({ params }: PageProps) {
  const product = await getProductById(params.id);

  if (!product) notFound();

  return <ProductView product={product} />;
}