export interface Artisan {
  id: string;
  name: string;
  bio: string;
  avatar: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  artisanId: string;
}