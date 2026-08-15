import Container from "@/components/ui/Container";
import Divider from "@/components/ui/Divider";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/ui/NavBar";

export default function Header () {
  return (
    <header className="w-full">
      <Container className="mb-2 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image src="/artisanHub.svg" alt="Artisan Hub Logo" width={245} height={55} sizes="245px" />
          </div>
          <div className="flex items-center gap-2 justify-end">
            <div>Niter&oacute;i, Rio de Janeiro, Brasil</div>
            <Divider className="h-6" orientation="vertical" />
            <Link href="/signup">
              Cadastre-se
            </Link>
            <Divider orientation="vertical" />
            <Link href="/signin">
              Conecte-se
            </Link>
          </div>
        </div>
      </Container>
      <Navbar />
    </header>
  );
}