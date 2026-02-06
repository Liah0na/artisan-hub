'use client';

import Image from "next/image";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

const Hero = () => {
  return (
    <section className="relative h-[80vh] w-full">
      <Image
        src="/alicja.jpg"
        alt="Artisan Hub"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-[1200px] px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl text-white"
          >
            <motion.h1
              variants={itemVariants}
              className="font-secondary text-4xl font-bold leading-tight md:text-5xl"
            >
              Nascido em Niterói.
              <br />
              Aberto para todo o Brasil.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-4 text-lg text-white/90"
            >
              Valorizar o feito à mão é valorizar pessoas.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-8 flex gap-4"
            >
              <button className="rounded-md bg-white px-6 py-3 font-medium text-black transition hover:bg-white/90">
                Explorar artesanos
              </button>

              <button className="rounded-md border border-white/70 px-6 py-3 font-medium text-white transition hover:bg-white/10">
                Saiba mais
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;