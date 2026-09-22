import Footer from "@/components/layout/landing-page/Footer";
import Header from "@/components/layout/landing-page/Header";
import LegalAccordion from "@/components/legal/LegalAccordion";

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16 md:px-8 md:py-20">

          {/* Header */}
          <header className="mb-12">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-[#0055cc]" />

              <span className="text-sm font-semibold uppercase tracking-[0.15em] text-[#0055cc]">
                ArtisanHub
              </span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Política de Cookies
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
              Entenda como o ArtisanHub utiliza cookies e tecnologias
              semelhantes para manter a plataforma funcionando.
            </p>

            <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
              <span>Última atualização</span>
              <span>•</span>
              <time dateTime="2026-09-22">
                22 de setembro de 2026
              </time>
            </div>
          </header>

          {/* Content */}
          <div className="border-t border-gray-200">

            <LegalAccordion
              number="01"
              title="O que são cookies?"
              defaultOpen
            >
              <p>
                Cookies são pequenos arquivos ou identificadores armazenados
                no dispositivo do usuário ou associados à sua sessão de
                navegação, utilizados para permitir determinadas
                funcionalidades e melhorar a operação de um site ou
                aplicação.
              </p>

              <p className="mt-4">
                Dependendo de sua finalidade, cookies podem ser utilizados
                para autenticação, segurança, preferências, análise de uso
                ou publicidade.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="02"
              title="Como o ArtisanHub utiliza cookies"
            >
              <p>
                O ArtisanHub utiliza principalmente tecnologias necessárias
                para o funcionamento da plataforma, incluindo mecanismos
                relacionados à autenticação, sessão e segurança.
              </p>

              <p className="mt-4">
                Esses mecanismos são necessários para que determinadas
                funcionalidades possam operar corretamente, especialmente
                aquelas relacionadas ao acesso a contas de usuários.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="03"
              title="Cookies estritamente necessários"
            >
              <p>
                Os cookies e identificadores estritamente necessários podem
                ser utilizados para:
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li>manter sessões de autenticação;</li>
                <li>proteger contas e funcionalidades;</li>
                <li>auxiliar na prevenção de atividades abusivas;</li>
                <li>manter determinadas preferências técnicas; e</li>
                <li>
                  permitir o funcionamento adequado dos recursos da plataforma.
                </li>
              </ul>

              <p className="mt-4">
                Por serem necessários para determinadas funcionalidades,
                desabilitar esses mecanismos poderá impedir ou prejudicar o
                funcionamento de partes do ArtisanHub.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="04"
              title="Cookies de análise e publicidade"
            >
              <p>
                Na versão atual do ArtisanHub, não utilizamos cookies de
                publicidade comportamental para direcionar anúncios aos
                usuários.
              </p>

              <p className="mt-4">
                Também não utilizamos, na configuração atual da plataforma,
                cookies de análise de terceiros destinados a criar perfis
                comportamentais dos usuários.
              </p>

              <p className="mt-4">
                Caso sejam introduzidas novas tecnologias com finalidades de
                análise, publicidade ou outras finalidades não essenciais,
                esta Política será atualizada e serão adotadas as medidas
                necessárias de transparência e, quando aplicável, obtenção de
                consentimento.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="05"
              title="Cookies de terceiros"
            >
              <p>
                Alguns serviços utilizados para fornecer funcionalidades do
                ArtisanHub poderão utilizar tecnologias próprias de
                identificação ou armazenamento, de acordo com suas respectivas
                políticas.
              </p>

              <p className="mt-4">
                O uso dessas tecnologias estará sujeito às condições e
                políticas dos respectivos fornecedores, quando aplicável.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="06"
              title="Gerenciamento de cookies"
            >
              <p>
                O usuário pode utilizar as configurações de seu navegador
                para bloquear, restringir ou excluir determinados cookies.
              </p>

              <p className="mt-4">
                Entretanto, o bloqueio de cookies estritamente necessários
                poderá afetar a autenticação, a segurança ou outras
                funcionalidades do ArtisanHub.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="07"
              title="Atualizações desta Política"
            >
              <p>
                Esta Política de Cookies poderá ser atualizada sempre que
                houver alteração nas tecnologias utilizadas pelo ArtisanHub,
                nas funcionalidades da plataforma ou na legislação aplicável.
              </p>

              <p className="mt-4">
                A versão atualizada será disponibilizada nesta página com a
                respectiva data de atualização.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="08"
              title="Contato"
            >
              <p>
                Para dúvidas relacionadas ao uso de cookies e tecnologias
                semelhantes no ArtisanHub, entre em contato:
              </p>

              <p className="mt-4 font-medium text-gray-800">
                [E-MAIL/CANAL DE PRIVACIDADE]
              </p>

              <p className="mt-4">
                Neuron IT Ltda.
              </p>

              <p className="mt-1">
                [ENDEREÇO DA EMPRESA, SE APLICÁVEL]
              </p>
            </LegalAccordion>
          </div>

          {/* Footer */}
          <footer className="mt-12 border-t border-gray-100 pt-6">
            <p className="text-sm leading-6 text-gray-400">
              Política de Cookies do ArtisanHub.
            </p>
          </footer>
        </div>
      </main>
      <Footer />
    </>
  );
}