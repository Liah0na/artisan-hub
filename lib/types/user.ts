export type User = {
  id: string;
  avatar: string | null;
  name: string;
  email: string;
  role: 'admin' | 'artisan';
  createdAt: string;
};