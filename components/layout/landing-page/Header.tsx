import Container from "@/components/ui/Container";
import Divider from "@/components/ui/Divider";
import Navbar from "@/components/ui/NavBar";
import Image from "next/image";

export default function Header () {
  return (
    <header className="w-full">
      <Container className="mb-2 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image src="/artisanHub.svg" alt="Artisan Hub Logo" width={245} height={55} />
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
      <Navbar />
    </header>
  );
}