export interface Artisan {
  id: string;
  userId: string;
  bio: string;
  location: string;
  rating: number;
}

export type Gallery = {
  id: string;
  productId: string;
  url: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  artisanId: string;
  stock: number;
  category: string;
  createdAt: string;
};

export type Review = {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  createdAt: string;
};

export type UserRole = 'admin' | 'artisan' | 'customer';