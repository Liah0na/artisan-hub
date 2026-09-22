import Footer from "@/components/layout/landing-page/Footer";
import Header from "@/components/layout/landing-page/Header";
import LegalAccordion from "@/components/legal/LegalAccordion";

export default function PrivacyPage() {
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
              Política de Privacidade
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
              Saiba como o ArtisanHub coleta, utiliza, armazena e protege
              seus dados pessoais.
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
              title="Quem somos"
              defaultOpen
            >
              <p>
                O ArtisanHub é uma plataforma digital destinada à divulgação
                de trabalhos artesanais e à conexão entre artesãos e pessoas
                interessadas em conhecer seus produtos e trabalhos.
              </p>

              <p className="mt-4">
                O ArtisanHub é desenvolvido, mantido e administrado pela
                Neuron IT Ltda., inscrita no CNPJ sob o nº
                [CNPJ DA NEURON IT LTDA.].
              </p>

              <p className="mt-4">
                Para os fins da legislação aplicável à proteção de dados
                pessoais, inclusive a Lei nº 13.709/2018 — Lei Geral de
                Proteção de Dados Pessoais (LGPD) — a Neuron IT Ltda. atua,
                conforme o contexto do tratamento, como agente responsável
                pelas decisões relacionadas às finalidades e aos meios
                essenciais de tratamento dos dados pessoais realizados por
                meio do ArtisanHub.
              </p>

              <p className="mt-4">
                O ArtisanHub não realiza a comercialização dos produtos
                apresentados pelos artesãos, não processa pagamentos, não
                realiza cobrança, não administra pedidos e não participa da
                negociação comercial realizada diretamente entre artesãos e
                interessados.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="02"
              title="Abrangência desta Política"
            >
              <p>
                Esta Política de Privacidade aplica-se aos dados pessoais
                tratados quando você acessa ou utiliza o ArtisanHub, cria
                uma conta, cadastra um perfil de artesão, publica produtos,
                entra em contato com um artesão ou utiliza funcionalidades
                administrativas da plataforma.
              </p>

              <p className="mt-4">
                Esta Política também descreve, de forma transparente, as
                principais categorias de dados tratados, suas finalidades,
                bases legais, formas de compartilhamento, medidas de
                segurança e direitos dos titulares.
              </p>

              <p className="mt-4">
                Esta Política não regula o tratamento de dados realizado
                diretamente por terceiros fora do ArtisanHub, inclusive
                quando um usuário é direcionado a outro site, rede social,
                serviço ou canal de comunicação externo.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="03"
              title="Dados pessoais que podemos coletar"
            >
              <p>
                Dependendo da forma como você utiliza a plataforma, podemos
                tratar as seguintes categorias de dados pessoais:
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li>
                  <strong>Dados de conta:</strong> nome, endereço de e-mail,
                  credenciais de acesso e informações relacionadas à
                  verificação da conta.
                </li>

                <li>
                  <strong>Dados de autenticação:</strong> informações
                  necessárias para autenticação e segurança da conta,
                  incluindo credenciais armazenadas de forma protegida.
                </li>

                <li>
                  <strong>Dados de perfil público:</strong> nome, foto ou
                  avatar, biografia, telefone, Instagram, localização e
                  outras informações que o próprio artesão escolha
                  disponibilizar publicamente.
                </li>

                <li>
                  <strong>Dados de produtos:</strong> nome do produto,
                  descrição, imagens, preço, disponibilidade e demais
                  informações inseridas pelo artesão.
                </li>

                <li>
                  <strong>Mensagens de contato:</strong> nome, endereço de
                  e-mail e conteúdo da mensagem enviada por meio dos
                  recursos de contato da plataforma.
                </li>

                <li>
                  <strong>Dados técnicos e de segurança:</strong> informações
                  necessárias para funcionamento, autenticação, prevenção de
                  abusos, segurança e proteção da plataforma.
                </li>
              </ul>

              <p className="mt-4">
                O ArtisanHub não solicita intencionalmente dados pessoais
                sensíveis para a utilização normal da plataforma. O usuário
                deve evitar inserir informações sensíveis desnecessárias em
                perfis, descrições de produtos ou mensagens.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="04"
              title="Dados disponibilizados publicamente"
            >
              <p>
                Algumas funcionalidades do ArtisanHub foram desenvolvidas
                para permitir que artesãos apresentem publicamente seus
                trabalhos.
              </p>

              <p className="mt-4">
                Ao criar e publicar um perfil ou produto, o artesão reconhece
                que determinadas informações poderão ser visualizadas por
                visitantes da plataforma.
              </p>

              <p className="mt-4">
                Dependendo das informações fornecidas pelo próprio artesão,
                podem ser exibidos publicamente nome, avatar, biografia,
                telefone, Instagram, localização, informações sobre produtos,
                imagens, descrição, preço e disponibilidade.
              </p>

              <p className="mt-4">
                O endereço de e-mail utilizado para autenticação da conta não
                é apresentado como informação pública do perfil.
              </p>

              <p className="mt-4">
                O usuário é responsável por avaliar cuidadosamente quais
                informações deseja tornar públicas.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="05"
              title="Finalidades do tratamento"
            >
              <p>
                Os dados pessoais poderão ser tratados para as seguintes
                finalidades:
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li>criação e gerenciamento de contas;</li>
                <li>autenticação e controle de acesso;</li>
                <li>verificação de endereço de e-mail;</li>
                <li>publicação e gerenciamento de perfis de artesãos;</li>
                <li>publicação e gerenciamento de produtos;</li>
                <li>possibilitar o contato entre interessados e artesãos;</li>
                <li>prestação e manutenção das funcionalidades da plataforma;</li>
                <li>prevenção de fraude, abuso e utilização indevida;</li>
                <li>segurança da plataforma e de seus usuários;</li>
                <li>cumprimento de obrigações legais ou regulatórias;</li>
                <li>exercício regular de direitos;</li>
                <li>atendimento de solicitações dos titulares; e</li>
                <li>
                  manutenção, melhoria e proteção da infraestrutura do
                  ArtisanHub.
                </li>
              </ul>
            </LegalAccordion>

            <LegalAccordion
              number="06"
              title="Bases legais"
            >
              <p>
                O tratamento de dados pessoais realizado pelo ArtisanHub
                deverá estar fundamentado em uma das hipóteses legais
                previstas na legislação aplicável, conforme a finalidade e
                as circunstâncias de cada tratamento.
              </p>

              <p className="mt-4">
                Entre as bases legais que poderão ser aplicáveis estão:
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li>
                  execução de contrato ou de procedimentos preliminares
                  relacionados a contrato;
                </li>

                <li>
                  cumprimento de obrigação legal ou regulatória;
                </li>

                <li>
                  exercício regular de direitos;
                </li>

                <li>
                  legítimo interesse, quando aplicável e observados os
                  requisitos legais;
                </li>

                <li>
                  consentimento, quando esta for a hipótese legal adequada.
                </li>
              </ul>

              <p className="mt-4">
                A base legal aplicável depende da natureza específica do
                tratamento realizado.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="07"
              title="Compartilhamento de dados"
            >
              <p>
                O ArtisanHub poderá utilizar prestadores de serviços e
                fornecedores de infraestrutura necessários para disponibilizar
                e proteger a plataforma.
              </p>

              <p className="mt-4">
                Dependendo da funcionalidade utilizada, isso poderá envolver
                fornecedores relacionados a:
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li>hospedagem e infraestrutura;</li>
                <li>armazenamento de banco de dados;</li>
                <li>armazenamento e distribuição de imagens;</li>
                <li>envio de e-mails;</li>
                <li>autenticação e segurança; e</li>
                <li>monitoramento e prevenção de abuso.</li>
              </ul>

              <p className="mt-4">
                O compartilhamento será limitado ao necessário para as
                finalidades correspondentes e deverá observar as obrigações
                aplicáveis de segurança e proteção de dados.
              </p>

              <p className="mt-4">
                O ArtisanHub não comercializa dados pessoais dos usuários.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="08"
              title="Transferências internacionais"
            >
              <p>
                Alguns fornecedores utilizados para operação da plataforma
                poderão estar localizados fora do Brasil ou utilizar
                infraestrutura internacional.
              </p>

              <p className="mt-4">
                Quando houver transferência internacional de dados pessoais,
                o tratamento deverá observar os requisitos estabelecidos pela
                LGPD e pela regulamentação aplicável da Autoridade Nacional
                de Proteção de Dados — ANPD.
              </p>

              <p className="mt-4">
                O ArtisanHub buscará utilizar mecanismos jurídicos adequados
                para essas transferências e adotar medidas compatíveis de
                segurança e proteção de dados.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="09"
              title="Segurança da informação"
            >
              <p>
                O ArtisanHub adota medidas técnicas e organizacionais
                destinadas a proteger os dados pessoais contra acessos não
                autorizados e situações acidentais ou ilícitas de destruição,
                perda, alteração, comunicação ou difusão.
              </p>

              <p className="mt-4">
                Entre as medidas aplicáveis estão mecanismos de autenticação,
                armazenamento protegido de credenciais, controle de acesso,
                validação de arquivos enviados, mecanismos de proteção contra
                requisições não autorizadas e medidas destinadas à prevenção
                de abuso.
              </p>

              <p className="mt-4">
                Nenhum sistema conectado à internet pode ser considerado
                absolutamente seguro. Por esse motivo, embora sejam adotadas
                medidas razoáveis de proteção, não é possível garantir
                segurança absoluta.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="10"
              title="Retenção e eliminação de dados"
            >
              <p>
                Os dados pessoais serão mantidos pelo período necessário para
                cumprir as finalidades para as quais foram coletados, cumprir
                obrigações legais, exercer direitos ou atender outras
                hipóteses legítimas de retenção previstas na legislação.
              </p>

              <p className="mt-4">
                Mensagens enviadas por meio do formulário de contato possuem
                política específica de retenção:
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li>
                  mensagens não lidas: retenção de até 30 dias;
                </li>
                <li>
                  mensagens lidas: retenção de até 180 dias.
                </li>
              </ul>

              <p className="mt-4">
                A eliminação ordinária dessas mensagens é realizada por
                processo periódico de limpeza, observadas as exceções legais
                aplicáveis.
              </p>

              <p className="mt-4">
                Dados sujeitos a obrigação legal, investigação de segurança,
                prevenção de fraude, exercício ou defesa de direitos ou outra
                hipótese legítima poderão ser mantidos pelo período necessário
                para a respectiva finalidade.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="11"
              title="Exclusão da conta"
            >
              <p>
                O artesão poderá solicitar a exclusão de sua conta conforme
                os mecanismos disponibilizados pelo ArtisanHub.
              </p>

              <p className="mt-4">
                Quando a exclusão for processada, poderão ser removidos o
                perfil, os produtos associados à conta e os arquivos de mídia
                vinculados, observadas as obrigações legais e as hipóteses
                legítimas de retenção.
              </p>

              <p className="mt-4">
                Arquivos armazenados em serviços de terceiros poderão ser
                submetidos a processos de limpeza após a remoção de suas
                referências na plataforma.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="12"
              title="Direitos dos titulares"
            >
              <p>
                Nos termos da legislação aplicável, o titular poderá exercer,
                conforme o caso, direitos relacionados aos seus dados pessoais,
                incluindo:
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li>confirmação da existência de tratamento;</li>
                <li>acesso aos dados;</li>
                <li>correção de dados incompletos, inexatos ou desatualizados;</li>
                <li>
                  solicitação de anonimização, bloqueio ou eliminação, quando
                  aplicável;
                </li>
                <li>
                  informações sobre compartilhamento e uso dos dados;
                </li>
                <li>
                  revogação do consentimento, quando o tratamento estiver
                  fundamentado nessa base legal; e
                </li>
                <li>
                  outros direitos previstos na legislação aplicável.
                </li>
              </ul>

              <p className="mt-4">
                Algumas solicitações poderão estar sujeitas às limitações
                previstas na própria legislação.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="13"
              title="Canal de privacidade"
            >
              <p>
                Para dúvidas, solicitações ou assuntos relacionados ao
                tratamento de dados pessoais, o titular poderá entrar em
                contato por meio do canal de privacidade:
              </p>

              <p className="mt-4 font-medium text-gray-800">
                [E-MAIL/CANAL DE PRIVACIDADE]
              </p>

              <p className="mt-4">
                Para proteção dos dados pessoais, poderemos solicitar
                informações razoáveis para confirmar a identidade do
                solicitante antes de atender determinadas solicitações.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="14"
              title="Alterações desta Política"
            >
              <p>
                Esta Política de Privacidade poderá ser atualizada para
                refletir alterações na legislação, nas funcionalidades do
                ArtisanHub, nos serviços utilizados ou nas práticas de
                tratamento de dados.
              </p>

              <p className="mt-4">
                A versão mais recente será disponibilizada nesta página,
                acompanhada da respectiva data de atualização.
              </p>
            </LegalAccordion>

            <LegalAccordion
              number="15"
              title="Disposições finais"
            >
              <p>
                Esta Política deve ser interpretada em conjunto com os
                Termos de Uso e a Política de Cookies do ArtisanHub.
              </p>

              <p className="mt-4">
                O tratamento de dados pessoais observará a legislação
                brasileira aplicável, especialmente a Lei Geral de Proteção
                de Dados Pessoais — LGPD.
              </p>
            </LegalAccordion>
          </div>

          {/* Footer */}
          <footer className="mt-12 border-t border-gray-100 pt-6">
            <p className="text-sm leading-6 text-gray-400">
              Política de Privacidade do ArtisanHub.
            </p>
          </footer>
        </div>
      </main>
      <Footer />
    </>
  );
}
