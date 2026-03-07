'use client';

import Image from 'next/image';
import { useState } from "react";
import Header from '@/components/layout/landing-page/Header';
import Footer from '@/components/layout/landing-page/Footer';
import ProductCard from '@/components/ui/ProductCard';
import Container from '@/components/ui/Container';
import { Gallery, Product } from '@/lib/types';


interface ProductDetail extends Product {
  gallery: Gallery[];
  relatedProducts: Product[];
}

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
              <div className="flex gap-1 overflow-x-auto overflow-y-hidden py-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`mx-1 relative w-27 h-27 rounded-lg border-2 transition ${
                      currentIndex === index
                        ? 'border-primary scale-105'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${index}`}
                      fill
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

/*

export default function ProductView({ product }: Props) {
  const mainImage = buildCloudinaryUrl(product.mainImage, 800);
  
  return (
    <>
      <Header />

      <Container className="py-8">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-2xl">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </div>

          <div>
            <h1 className="mb-4 text-3xl font-bold">{product.name}</h1>
            <p className="mb-4 text-lg text-gray-600">
              ${product.price.toFixed(2)}
            </p>
            <p className="mb-6 text-gray-700">
              {product.description}
            </p>
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
  */