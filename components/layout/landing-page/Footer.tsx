import Container from "@/components/ui/Container";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="border-t border-primary py-8">
      <Container>
        <div className="grid gap-4 grid-cols-3">
          <Image src="/logo.png" alt="Artisan Hub Logo" width={122} height={27} />
          <ul>
            <li><a href="#" className="mx-2 text-gray-400 hover:text-white transition-colors duration-300">Política de Privacidad</a></li>
            <li><a href="#" className="mx-2 text-gray-400 hover:text-white transition-colors duration-300">Términos de Servicio</a></li>
            <li><a href="#" className="mx-2 text-gray-400 hover:text-white transition-colors duration-300">Contacto</a></li>
          </ul>
          <div>
            <p className="text-sm">&copy; 2026 ArtisanHub. Todos los derechos reservados.</p>
            <p className="flex gap-1 text-sm">
              Powered by: <Image src="/neuron.svg" alt="Neuron IT" width={100} height={20} />
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;