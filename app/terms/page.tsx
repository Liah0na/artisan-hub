import Footer from "@/components/layout/landing-page/Footer";
import Header from "@/components/layout/landing-page/Header";
import LegalAccordion from "@/components/legal/LegalAccordion";

export default function TermsPage() {
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
              Termos de Uso
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
              Regras e condições para utilização do ArtisanHub.
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
              title="Sobre o ArtisanHub"
              defaultOpen
            >
              <p>
                O ArtisanHub é uma plataforma digital destinada à divulgação
                de trabalhos artesanais e à conexão entre artesãos e pessoas
                interessadas em seus produtos.
              </p>

              <p className="mt-4">
                A plataforma é desenvolvida e mantida pela Neuron IT Ltda.,
                inscrita no CNPJ sob o nº [CNPJ DA NEURON IT LTDA.].
              </p>

              <p className="mt-4">
                O ArtisanHub não é uma loja virtual, marketplace transacional
                ou intermediador de pagamentos.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="02"
              title="Aceitação dos Termos"
            >
              <p>
                Ao acessar ou utilizar o ArtisanHub, o usuário declara que
                leu, compreendeu e concorda com estes Termos de Uso.
              </p>

              <p className="mt-4">
                Caso o usuário não concorde com estes Termos, deverá
                interromper a utilização da plataforma.
              </p>

              <p className="mt-4">
                O uso continuado da plataforma após alterações dos Termos
                poderá representar aceitação da versão atualizada, conforme
                aplicável.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="03"
              title="Cadastro e conta"
            >
              <p>
                Algumas funcionalidades do ArtisanHub exigem a criação de
                uma conta.
              </p>

              <p className="mt-4">
                O usuário deve fornecer informações verdadeiras, completas e
                atualizadas e é responsável pela manutenção da segurança de
                suas credenciais.
              </p>

              <p className="mt-4">
                A conta é pessoal e não deve ser compartilhada com terceiros
                de forma que comprometa sua segurança.
              </p>

              <p className="mt-4">
                O usuário deverá comunicar ao ArtisanHub qualquer uso não
                autorizado ou suspeita de comprometimento de sua conta.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="04"
              title="Uso por artesãos"
            >
              <p>
                Os artesãos podem utilizar o ArtisanHub para apresentar seus
                perfis e produtos, conforme as funcionalidades disponibilizadas
                pela plataforma.
              </p>

              <p className="mt-4">
                O artesão é integralmente responsável pelas informações que
                publica, incluindo descrições, imagens, preços,
                disponibilidade, características e demais informações
                relacionadas aos seus produtos.
              </p>

              <p className="mt-4">
                O artesão também é responsável por manter atualizadas as
                informações apresentadas ao público.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="05"
              title="Relação comercial entre usuários"
            >
              <p>
                O ArtisanHub não realiza nem intermedeia a comercialização
                dos produtos apresentados pelos artesãos.
              </p>

              <p className="mt-4">
                O ArtisanHub não participa da negociação entre artesão e
                interessado e não atua como representante de qualquer das
                partes.
              </p>

              <p className="mt-4">
                Eventuais negociações, pedidos, pagamentos, condições de
                entrega, prazos, garantias, trocas, devoluções e demais
                condições comerciais são tratados diretamente entre o artesão
                e o interessado.
              </p>

              <p className="mt-4">
                O ArtisanHub não realiza checkout, cobrança, processamento de
                cartão, PIX, transferência bancária ou qualquer outro
                processamento de pagamento relacionado à compra dos produtos.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="06"
              title="Conteúdo publicado pelos usuários"
            >
              <p>
                O usuário é responsável pelo conteúdo que publica ou envia ao
                ArtisanHub.
              </p>

              <p className="mt-4">
                O conteúdo não deverá violar a legislação aplicável, direitos
                de terceiros ou estes Termos de Uso.
              </p>

              <p className="mt-4">
                É proibido publicar conteúdo que:
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li>seja ilegal ou fraudulento;</li>
                <li>viole direitos autorais ou de propriedade intelectual;</li>
                <li>contenha informações pessoais de terceiros sem autorização;</li>
                <li>contenha malware ou código malicioso;</li>
                <li>tenha finalidade de fraude, phishing ou abuso;</li>
                <li>induza terceiros a erro de forma ilícita; ou</li>
                <li>
                  possa comprometer a segurança ou funcionamento da plataforma.
                </li>
              </ul>
            </LegalAccordion>

            <LegalAccordion
              number="07"
              title="Propriedade intelectual"
            >
              <p>
                A estrutura, software, identidade visual, marcas, textos
                institucionais, elementos gráficos e demais componentes
                próprios do ArtisanHub são protegidos pela legislação
                aplicável.
              </p>

              <p className="mt-4">
                O usuário mantém os direitos que possuir sobre o conteúdo que
                publicar, sem prejuízo da autorização necessária para que o
                ArtisanHub possa hospedar, armazenar, reproduzir tecnicamente
                e exibir esse conteúdo dentro das funcionalidades da
                plataforma.
              </p>

              <p className="mt-4">
                O usuário declara possuir os direitos ou autorizações
                necessários para publicar imagens, textos e demais conteúdos
                enviados à plataforma.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="08"
              title="Responsabilidades do ArtisanHub"
            >
              <p>
                O ArtisanHub busca disponibilizar a plataforma de forma
                segura, funcional e adequada às finalidades descritas nestes
                Termos.
              </p>

              <p className="mt-4">
                Entretanto, o ArtisanHub não garante que a plataforma estará
                permanentemente disponível, livre de erros ou totalmente
                imune a interrupções, falhas técnicas ou eventos externos.
              </p>

              <p className="mt-4">
                O ArtisanHub também não garante a qualidade, autenticidade,
                legalidade, disponibilidade, preço, segurança, origem ou
                qualquer outra característica dos produtos apresentados pelos
                artesãos.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="09"
              title="Condutas proibidas"
            >
              <p>
                É proibido utilizar o ArtisanHub para:
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li>praticar atividades ilícitas;</li>
                <li>fraudar ou tentar fraudar outros usuários;</li>
                <li>
                  obter acesso não autorizado a contas ou sistemas;
                </li>
                <li>
                  introduzir vírus, malware ou código malicioso;
                </li>
                <li>
                  realizar ataques ou tentativas de comprometer a infraestrutura;
                </li>
                <li>
                  coletar dados de outros usuários de forma indevida;
                </li>
                <li>
                  utilizar mecanismos automatizados de maneira abusiva;
                </li>
                <li>
                  publicar conteúdo que viole direitos de terceiros; ou
                </li>
                <li>
                  utilizar a plataforma para finalidade incompatível com estes
                  Termos.
                </li>
              </ul>
            </LegalAccordion>

            <LegalAccordion
              number="10"
              title="Suspensão ou encerramento da conta"
            >
              <p>
                O ArtisanHub poderá restringir, suspender ou encerrar uma
                conta quando houver fundamento legítimo, incluindo violação
                destes Termos, utilização abusiva, fraude, ameaça à segurança
                ou exigência legal.
              </p>

              <p className="mt-4">
                Sempre que apropriado e possível, poderão ser adotadas medidas
                proporcionais à natureza da situação.
              </p>

              <p className="mt-4">
                O usuário também poderá solicitar a exclusão de sua conta,
                observadas as disposições da Política de Privacidade e as
                obrigações legais de retenção.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="11"
              title="Disponibilidade e alterações da plataforma"
            >
              <p>
                Funcionalidades do ArtisanHub poderão ser modificadas,
                aprimoradas, substituídas ou descontinuadas para atender
                necessidades técnicas, operacionais ou legais.
              </p>

              <p className="mt-4">
                O ArtisanHub poderá realizar manutenção programada ou
                emergencial e, quando possível, buscará minimizar eventuais
                interrupções.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="12"
              title="Privacidade e cookies"
            >
              <p>
                O tratamento de dados pessoais realizado pelo ArtisanHub é
                regulado pela Política de Privacidade.
              </p>

              <p className="mt-4">
                A utilização de cookies e tecnologias semelhantes é descrita
                na Política de Cookies.
              </p>

              <p className="mt-4">
                Os documentos fazem parte do conjunto de regras aplicáveis à
                utilização da plataforma.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="13"
              title="Links e serviços de terceiros"
            >
              <p>
                O ArtisanHub poderá apresentar links ou referências a serviços
                de terceiros, incluindo redes sociais ou outros canais
                utilizados pelos artesãos.
              </p>

              <p className="mt-4">
                Esses serviços possuem suas próprias regras, políticas de
                privacidade e condições de utilização.
              </p>

              <p className="mt-4">
                O ArtisanHub não controla as práticas de terceiros e não se
                responsabiliza pelo conteúdo, funcionamento ou políticas de
                serviços externos.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="14"
              title="Limitação de responsabilidade"
            >
              <p>
                Na medida permitida pela legislação aplicável, o ArtisanHub
                não será responsável por prejuízos decorrentes de informações
                fornecidas incorretamente por usuários, negociações realizadas
                diretamente entre usuários, indisponibilidade temporária de
                serviços de terceiros ou utilização da plataforma em
                desacordo com estes Termos.
              </p>

              <p className="mt-4">
                Nada nestes Termos busca excluir ou limitar direitos ou
                responsabilidades que não possam ser legalmente excluídos ou
                limitados.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="15"
              title="Alterações dos Termos"
            >
              <p>
                Estes Termos poderão ser atualizados para refletir mudanças
                na plataforma, na legislação ou nas práticas operacionais do
                ArtisanHub.
              </p>

              <p className="mt-4">
                A versão atual estará disponível nesta página, acompanhada da
                respectiva data de atualização.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="16"
              title="Legislação aplicável"
            >
              <p>
                Estes Termos são regidos pela legislação brasileira, sem
                prejuízo das normas de aplicação obrigatória eventualmente
                aplicáveis ao usuário.
              </p>

              <p className="mt-4">
                Eventuais controvérsias serão tratadas perante o foro
                competente, observadas as regras legais aplicáveis,
                especialmente aquelas relacionadas à proteção do consumidor,
                quando aplicáveis.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="17"
              title="Contato"
            >
              <p>
                Para dúvidas ou assuntos relacionados a estes Termos de Uso,
                entre em contato:
              </p>

              <p className="mt-4 font-medium text-gray-800">
                [E-MAIL/CANAL DE CONTATO]
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
              Termos de Uso do ArtisanHub.
            </p>
          </footer>
        </div>
      </main>
      <Footer />
    </>
  );
}
