import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/services/product.service';
import ProductView from '@/components/layout/product/ProductView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) notFound();

  return <ProductView product={product} />;
}