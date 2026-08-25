import Header from '@/components/layout/landing-page/Header';
import Footer from '@/components/layout/landing-page/Footer';
import Container from '@/components/ui/Container';
import ContactForm from '@/components/layout/contact/ContactForm';

export const metadata = {
  title: 'Contato | Artisan Hub',
  description: 'Fale com a equipe do Artisan Hub.',
};

export default function ContactPage() {
  return (
    <>
      <Header />

      <section className="w-full py-16">
        <Container>
          <header className="mx-auto mb-14 max-w-xl text-center">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--color-secondary)]">
              Fale conosco
            </span>
            <h1 className="font-secondary mt-3 text-4xl font-semibold sm:text-5xl">
              Contato
            </h1>
            <p className="mt-4 text-black/60">
              Dúvidas, sugestões ou parcerias — envie sua mensagem e responderemos em breve.
            </p>
          </header>

          <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-[1fr_1.4fr]">
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-medium uppercase tracking-wide text-black/50">Localização</h2>
                <p className="mt-1 text-black/80">Niterói, Rio de Janeiro, Brasil</p>
              </div>
              <div>
                <h2 className="text-sm font-medium uppercase tracking-wide text-black/50">E-mail</h2>
                <a href="mailto:contato@artisanhub.com.br" className="mt-1 block text-black/80 hover:text-black">
                  contato@artisanhub.com.br
                </a>
              </div>
              <p className="text-sm text-black/50">
                Procurando um artesão específico? Visite o{' '}
                <a href="/artisans" className="underline hover:text-black">
                  catálogo de artesãos
                </a>{' '}
                e entre em contato diretamente pelo perfil dele.
              </p>
            </div>

            <ContactForm />
          </div>
        </Container>
      </section>

      <Footer />
    </>
  );
}
