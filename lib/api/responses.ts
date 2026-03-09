import { ProductDetail } from '@/lib/types';

export type ProductResponse = {
  product: ProductDetail;
};

export type ProductsResponse = {
  products: ProductDetail[];
};

export type ErrorResponse = {
  error: string;
};