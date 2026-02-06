import Header from "@/components/layout/landing-page/Header";
import Hero from "@/components/layout/landing-page/Hero";
import Products from "@/components/layout/landing-page/Products";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <h1>Welcome to Artisan Hub</h1>
      <p>Your one-stop platform for artisan crafts. The future is this <b>Ship</b>.</p>
      <Products />
    </>
  );
}
