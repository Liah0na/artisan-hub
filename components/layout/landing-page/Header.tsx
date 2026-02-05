import Container from "@/components/ui/Container";
import Divider from "@/components/ui/Divider";
import Image from "next/image";

export default function Header () {
  return (
    <header className="w-full">
      <Container>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image src="/logo.png" alt="Artisan Hub Logo" width={245} height={55} />
          </div>
          <div className="flex items-center gap-2 h-10 justify-end">
            <div>Niterói, Rio de Janeiro, Brasil</div>
            <Divider className="h-6" orientation="vertical" />
            <p>Cadastre-se</p>
            <Divider orientation="vertical" />
            <p>Conecte-se</p>
          </div>
        </div>
      </Container>
      <nav className="navbar w-full mt-4">
        <Container>
          <ul className="flex gap-6">
            <li>Início</li>
            <li>Sobre</li>
            <li>Artesãos</li>
            <li>Contato</li>
          </ul>
        </Container>
      </nav>
    </header>
  );
}