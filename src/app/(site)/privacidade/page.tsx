import type { Metadata } from "next";
import { CabecalhoPagina } from "@/components/site/cabecalho-pagina";
import { obterConfiguracao } from "@/lib/configuracao";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description:
    "Como coletamos, usamos e protegemos os dados enviados pelos formulários do site.",
};

export default async function PaginaPrivacidade() {
  const c = await obterConfiguracao();

  return (
    <>
      <CabecalhoPagina
        titulo="POLÍTICA DE PRIVACIDADE"
        descricao="Como tratamos os dados que você nos envia pelo site."
        migalhas={[{ label: "Política de privacidade" }]}
      />

      <div className="container-page max-w-3xl py-10">
        <div className="space-y-8 text-sm leading-relaxed text-text-muted md:text-[15px]">
          <Bloco titulo="1. Quais dados coletamos">
            <p>
              Coletamos apenas os dados que você informa voluntariamente nos
              formulários do site: nome, e-mail, telefone e a mensagem enviada. Na
              simulação de financiamento também coletamos CPF e data de nascimento,
              necessários para a análise de crédito. Na avaliação de troca coletamos
              os dados do veículo (placa, marca, modelo, ano e quilometragem).
            </p>
          </Bloco>

          <Bloco titulo="2. Para que usamos">
            <p>
              Os dados são usados exclusivamente para responder ao seu contato,
              apresentar propostas de veículos, encaminhar a análise de crédito às
              instituições financeiras parceiras e avaliar o veículo oferecido em
              troca. Se você marcar a opção correspondente, também podemos enviar
              ofertas e novidades.
            </p>
          </Bloco>

          <Bloco titulo="3. Com quem compartilhamos">
            <p>
              Não vendemos seus dados. O compartilhamento acontece apenas com
              instituições financeiras parceiras, quando você solicita uma simulação
              de financiamento, e com prestadores de serviço necessários à operação
              do site, sempre limitados à finalidade informada.
            </p>
          </Bloco>

          <Bloco titulo="4. Por quanto tempo guardamos">
            <p>
              Mantemos os dados enquanto durar o atendimento e pelo prazo necessário
              ao cumprimento de obrigações legais. Depois disso, os registros são
              eliminados ou anonimizados.
            </p>
          </Bloco>

          <Bloco titulo="5. Seus direitos (LGPD)">
            <p>
              Conforme a Lei nº 13.709/2018, você pode solicitar a confirmação do
              tratamento, o acesso, a correção, a portabilidade, a anonimização ou a
              exclusão dos seus dados, além de revogar o consentimento a qualquer
              momento.
            </p>
          </Bloco>

          <Bloco titulo="6. Cookies">
            <p>
              Utilizamos cookies essenciais ao funcionamento do site, como o registro
              da sessão do painel administrativo. Você pode bloquear cookies no seu
              navegador, mas algumas funções podem deixar de operar corretamente.
            </p>
          </Bloco>

          <Bloco titulo="7. Como falar conosco">
            <p>
              Para exercer seus direitos ou tirar dúvidas sobre esta política, entre
              em contato:
            </p>
            <ul className="mt-3 space-y-1">
              {c.email && (
                <li>
                  E-mail:{" "}
                  <a href={`mailto:${c.email}`} className="font-semibold text-brand">
                    {c.email}
                  </a>
                </li>
              )}
              {c.telefone && <li>Telefone: {c.telefone}</li>}
              {c.endereco && (
                <li>
                  Endereço: {c.endereco}, {c.cidade} - {c.estado}
                </li>
              )}
            </ul>
          </Bloco>
        </div>
      </div>
    </>
  );
}

function Bloco({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2.5 text-base font-bold text-text">{titulo}</h2>
      {children}
    </section>
  );
}
