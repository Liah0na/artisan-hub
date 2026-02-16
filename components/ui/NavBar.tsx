'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Container from './Container';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
      <nav className={`w-full font-medium ${scrolled ? 'fixed top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm' : 'navbar'}`}>
        <Container className="grid grid-cols-2 p-6"> 
        <Link className={`${scrolled ? 'display-logo' : 'hidden-logo '}`} href="/">
          <Image
            src="/artisanHub.svg"
            alt="ArtisanHub Logo"
            width={160}
            height={40}
            priority
          />
        </Link>
        <ul className={`flex gap-8 font-medium transition-colors duration-300`}>
          <li><Link href="#">Início</Link></li>
          <li><Link href="#">Produtos</Link></li>
          <li><Link href="#">Artesãos</Link></li>
          <li><Link href="#">Blog</Link></li>
          <li><Link href="#">Contato</Link></li>
        </ul>
        </Container>
      </nav>
  );
};

export default Navbar;