import type { Metadata } from 'next';
import { jost, handlee } from '@/components/ui/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Artisan Hub',
  description: 'Uma vitrine digital para artesãos de Niterói e do Brasil inteiro. Conectando talentos locais com o mundo.',
  authors: [{ name: 'Nestor Ramiro Otondo Rios' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jost.variable} ${handlee.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
