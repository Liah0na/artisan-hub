import { User } from '@/lib/types';

export const users: User[] = [
  {
    id: 'user-001',
    name: 'Admin System',
    email: 'admin@artisanhub.com',
    role: 'admin',
    avatar: '/images/users/admin.jpg',
    createdAt: '2026-01-01',
  },
  {
    id: 'user-002',
    name: 'Lucía Andrade',
    email: 'lucia@artisanhub.com',
    role: 'artisan',
    avatar: '/images/artisans/lucia.jpg',
    createdAt: '2026-01-02',
  },
  {
    id: 'user-003',
    name: 'Rafael Costa',
    email: 'rafael@artisanhub.com',
    role: 'artisan',
    avatar: '/images/artisans/rafael.jpg',
    createdAt: '2026-01-03',
  },
  {
    id: 'user-004',
    name: 'Mariana López',
    email: 'mariana@artisanhub.com',
    role: 'artisan',
    avatar: '/images/artisans/mariana.jpg',
    createdAt: '2026-01-04',
  },
  {
    id: 'user-005',
    name: 'Carlos Mendes',
    email: 'carlos@email.com',
    role: 'customer',
    avatar: '/images/users/customer1.jpg',
    createdAt: '2026-01-10',
  },
  {
    id: 'user-006',
    name: 'Ana Rodríguez',
    email: 'ana@email.com',
    role: 'customer',
    avatar: '/images/users/customer2.jpg',
    createdAt: '2026-01-11',
  },
];