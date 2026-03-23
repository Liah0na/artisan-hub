'use client'

import Image from 'next/image';
import Footer from '@/components/layout/landing-page/Footer';
import Header from '@/components/layout/landing-page/Header';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import ProductCard from '@/components/ui/ProductCard';
import { Artisan } from '@/lib/types/artisan';
import { Product } from '@/lib/types/product';

const ArtisanProfile = ({ artisan, products }: { artisan: Artisan; products: Product[] }) => {
  return (
    <>
      <Header />

      <Container className="relative mt-20">

        {/* PROFILE HEADER */}
        <div className="bg-white border-primary rounded-2xl shadow-sm border p-8 flex flex-col md:flex-row gap-6 items-center md:items-start">

          {/* AVATAR */}
          <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-white shadow-md flex-shrink-0">
            <Image
              src={artisan?.avatar || "/default.jpg"}
              alt={artisan.name}
              fill
              sizes="256px"
              className="object-cover"
            />
          </div>

          {/* INFO */}
          <div className="flex flex-col text-center md:text-left gap-2">

            <h1 className="text-3xl font-bold tracking-tight">
              {artisan.name}
            </h1>

            <p className="text-gray-600 mt-2">
              {artisan.bio}
            </p>

            {/* ACTIONS */}
            <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">

              <Button
                href="#"
                className="background-primary px-4 py-2 rounded-md hover:my-bg-secondary text-white"
              >
                Follow
              </Button>

              <Button
                href="#"
                className="background-primary px-4 py-2 rounded-md hover:my-bg-secondary text-white"
              >
                Message
              </Button>

              <Button
                href="#"
                className="background-primary px-4 py-2 rounded-md hover:my-bg-secondary text-white"
              >
                Visit Shop
              </Button>
            </div>
            {/**/}

          </div>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-6 mt-8">

          <div className="bg-white border rounded-xl p-6 text-center">
            <p className="text-2xl font-semibold">
              {/*artisan.products?.length || 0*/}
            </p>
            <p className="text-sm text-gray-500">
              Products
            </p>
          </div>

          <div className="bg-white border rounded-xl p-6 text-center">
            <p className="text-2xl font-semibold">
              {/*artisan.rating*/}
            </p>
            <p className="text-sm text-gray-500">
              Rating
            </p>
          </div>

          <div className="bg-white border rounded-xl p-6 text-center">
            <p className="text-2xl font-semibold">
              124
            </p>
            <p className="text-sm text-gray-500">
              Followers
            </p>
          </div>

        </div>

        {/* PRODUCTS */}
        <div className="mt-14">

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              Products
            </h2>

            <span className="text-sm text-gray-500">
              {products?.length || 0} items
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {products?.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}

          </div>

        </div>

      </Container>

      <Footer />
    </>
  )
}

export default ArtisanProfile;