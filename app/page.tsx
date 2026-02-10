import ArtisansSection from '@/components/layout/landing-page/ArtisanSection';
import Footer from '@/components/layout/landing-page/Footer';
import Header from '@/components/layout/landing-page/Header';
import Hero from '@/components/layout/landing-page/Hero';
import News from '@/components/layout/landing-page/News';
import ProductsSection from '@/components/layout/landing-page/ProductsSection';

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <ProductsSection />
      <News />
      <ArtisansSection />
      <Footer />
    </>
  );
}
