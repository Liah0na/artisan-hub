import { Product } from '@/lib/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Handcrafted Ceramic Vase',
    price: 45.99,
    image: '/default.jpg',
    description: 'A beautiful handcrafted ceramic vase inspired by nature, perfect for adding a touch of elegance to any room.',
    artisanId: '1',
  },
  {
    id: '2',
    name: 'Wooden Coffee Table',
    price: 299.99,
    image: '/default.jpg',
    description: 'A unique handcrafted wooden coffee table with a rustic design, perfect for your living room.',
    artisanId: '2',
  },
  {
    id: '3',
    name: 'Art Deco Necklace',
    price: 129.99,
    image: '/default.jpg',
    description: 'A stunning art deco necklace made with precious metals and gemstones, perfect for special occasions.',
    artisanId: '3',
  },
];