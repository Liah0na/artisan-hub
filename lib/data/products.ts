import { Product } from '@/lib/types';

export const products: Product[] = [
  // CERAMICS
  {
    id: 'prod-001',
    name: 'Andean Ceramic Vase',
    description: 'Handcrafted ceramic vase with natural glaze.',
    price: 85,
    artisanId: 'artisan-001',
    stock: 10,
    category: 'Ceramics',
    createdAt: '2026-02-01',
  },
  {
    id: 'prod-002',
    name: 'Decorative Clay Bowl',
    description: 'Minimalist clay bowl for modern interiors.',
    price: 60,
    artisanId: 'artisan-001',
    stock: 15,
    category: 'Ceramics',
    createdAt: '2026-02-02',
  },

  // WOOD
  {
    id: 'prod-003',
    name: 'Rustic Wooden Chair',
    description: 'Sustainable hardwood handcrafted chair.',
    price: 220,
    artisanId: 'artisan-002',
    stock: 5,
    category: 'Furniture',
    createdAt: '2026-02-03',
  },
  {
    id: 'prod-004',
    name: 'Oak Coffee Table',
    description: 'Hand-finished oak coffee table.',
    price: 320,
    artisanId: 'artisan-002',
    stock: 3,
    category: 'Furniture',
    createdAt: '2026-02-04',
  },

  // TEXTILES
  {
    id: 'prod-005',
    name: 'Woven Textile Blanket',
    description: 'Traditional loom woven blanket.',
    price: 140,
    artisanId: 'artisan-003',
    stock: 8,
    category: 'Textiles',
    createdAt: '2026-02-05',
  },
  {
    id: 'prod-006',
    name: 'Handmade Wool Scarf',
    description: 'Soft handmade wool scarf.',
    price: 75,
    artisanId: 'artisan-003',
    stock: 20,
    category: 'Textiles',
    createdAt: '2026-02-06',
  },
];