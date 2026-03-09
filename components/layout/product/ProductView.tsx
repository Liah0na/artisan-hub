'use client';

import Image from 'next/image';
import { useRef, useState } from "react";
import { ProductDetail } from "@/lib/types";
import Header from '@/components/layout/landing-page/Header';
import Footer from '@/components/layout/landing-page/Footer';
import Container from '@/components/ui/Container';
import ArtisanCard from '@/components/ui/ArtisanCard';
import ProductCard from '@/components/ui/ProductCard';

interface Props {
  product: ProductDetail;
}

export default function ProductView({ product }: Props) {
  const images = [
    product.mainImage,
    ...product.gallery.map((g) => g.url),
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };
  const goPrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };
  const thumbsRef = useRef<HTMLDivElement | null>(null);
  const scrollThumbs = (dir: "left" | "right") => {
    if (!thumbsRef.current) return;

    const amount = 220;
    thumbsRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <>
      <Header />

      <Container className="py-8">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="relative aspect-square group">

            {/* IMAGE CONTAINER */}
            <div className="relative w-full h-full">
              <Image
                key={currentIndex}
                src={images[currentIndex]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-all rounded-lg duration-500 ease-in-out opacity-0 animate-fadeIn"
              />
            </div>

            {/* LEFT ARROW */}
            <button
              onClick={goPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 
                        backdrop-blur-md bg-white/30 hover:bg-white/50
                        rounded-full p-3 shadow-lg
                        transition-all duration-100
                        opacity-0 group-hover:opacity-100
                        hover:scale-110"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* RIGHT ARROW */}
            <button
              onClick={goNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 
                        backdrop-blur-md bg-white/30 hover:bg-white/50
                        rounded-full p-3 shadow-lg
                        transition-all duration-300
                        opacity-0 group-hover:opacity-100
                        hover:scale-110"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          
            {/* THUMBNAILS */}
            <div className="relative pt-2">

              {/* LEFT ARROW */}
              <button
                onClick={() => scrollThumbs("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10
                bg-white/80 hover:bg-white shadow rounded-full p-2
                transition hover:scale-110"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* RIGHT ARROW */}
              <button
                onClick={() => scrollThumbs("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10
                bg-white/80 hover:bg-white shadow rounded-full p-2
                transition hover:scale-110"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* SCROLL CONTAINER */}
              <div
                ref={thumbsRef}
                className="flex gap-1 overflow-x-auto overflow-y-hidden py-2 px-2 scrollbar-hide"
              >
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}   // usa tu función del slider
                    className={`mx-1 relative w-24 h-24 flex-shrink-0 rounded-lg border-2 transition
                    ${
                      currentIndex === index
                        ? "border-primary scale-105"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      sizes="96px"
                      className="object-cover rounded-lg"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h1 className="mb-4 text-3xl font-bold">{product.name}</h1>
            <p className="mb-4 text-lg text-gray-600">
              ${product.price.toFixed(2)}
            </p>
            <p className="mb-6 text-gray-700">
              {product.description}
            </p>
            {product.artisan && <ArtisanCard artisan={product.artisan} />}
          </div>
        </div>
      </Container>

      <Container className="mb-2 mt-2">
        {product.relatedProducts.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-6">
              More from this artisan
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.relatedProducts.map(related => (
                <ProductCard
                  key={related.id}
                  product={related}
                />
              ))}
            </div>
          </div>
        )}
      </Container>

      <Footer />
    </>
  );
}