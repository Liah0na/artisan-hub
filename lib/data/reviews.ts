import { Review } from '@/lib/types';

export const reviews: Review[] = [
  {
    id: 'rev-001',
    productId: 'prod-001',
    userId: 'user-005',
    rating: 5,
    comment: 'Absolutely beautiful craftsmanship!',
    createdAt: '2026-02-10',
  },
  {
    id: 'rev-002',
    productId: 'prod-001',
    userId: 'user-006',
    rating: 4,
    comment: 'Great quality, shipping was fast.',
    createdAt: '2026-02-11',
  },
  {
    id: 'rev-003',
    productId: 'prod-003',
    userId: 'user-005',
    rating: 5,
    comment: 'Sturdy and elegant design.',
    createdAt: '2026-02-12',
  },
];