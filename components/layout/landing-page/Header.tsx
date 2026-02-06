import Container from "@/components/ui/Container";
import Divider from "@/components/ui/Divider";
import Image from "next/image";

export default function Header () {
  return (
    <header className="w-full">
      <Container className="mb-2 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image src="/logo.png" alt="Artisan Hub Logo" width={245} height={55} />
          </div>
          <div className="flex items-center gap-2 justify-end">
            <div>Niterói, Rio de Janeiro, Brasil</div>
            <Divider className="h-6" orientation="vertical" />
            <p>Cadastre-se</p>
            <Divider orientation="vertical" />
            <p>Conecte-se</p>
          </div>
        </div>
      </Container>
      <nav className="navbar w-full">
        <Container className="p-6">
          <ul className="flex gap-8 text-lg font-medium">
            <li>Início</li>
            <li>Produtos</li>
            <li>Artesãos</li>
            <li>Feira de Artesanato</li>
            <li>Blog</li>
            <li>Contato</li>
          </ul>
        </Container>
      </nav>
    </header>
  );
}