import { Product } from '@/lib/types/product';

export const products: Product[] = [
  {
    id: 'prod-007',
    artisanId: 'art-001',
    categoryId: 'cat-001',
    description: 'Beautiful urban landscape photography print.',
    mainImage: '20241227_205325_alt_gy2nvy',
    name: 'Photography Print - "Urban Vibes"',
    price: 120,
    stock: 5,
    createdAt: '2026-03-03',
  },
  {
    id: 'prod-008',
    artisanId: 'art-001',
    categoryId: 'cat-001',
    description: 'Beautiful scenic photography print.',
    mainImage: 'v1774365494/20250226_060320_l0o9x1',
    name: 'Photography Print - "Scenic Beauty"',
    price: 95,
    stock: 5,
    createdAt: '2026-03-03',
  }
];