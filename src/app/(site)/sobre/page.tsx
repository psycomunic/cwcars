import type { Metadata } from "next";
import { Award, Handshake, HeartHandshake, Wrench } from "lucide-react";
import { CabecalhoPagina } from "@/components/site/cabecalho-pagina";
import { BotaoLink, Secao, TituloSecao } from "@/components/ui";
import { obterConfiguracao } from "@/lib/configuracao";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sobre nós",
  description:
    "Conheça a nossa história, a forma como selecionamos cada veículo e o que garantimos para quem compra com a gente.",
};

const VALORES = [
  {
    icone: Award,
    titulo: "Seleção criteriosa",
    texto:
      "Cada veículo passa por checagem documental, laudo cautelar e inspeção mecânica antes de ser anunciado.",
  },
  {
    icone: Handshake,
    titulo: "Negociação transparente",
    texto:
      "Preço claro, sem taxas escondidas. Mostramos a FIPE e a média de mercado em todo anúncio.",
  },
  {
    icone: Wrench,
    titulo: "Pós-venda de verdade",
    texto:
      "Revisão de entrega, garantia de motor e câmbio e uma equipe disponível depois da compra.",
  },
  {
    icone: HeartHandshake,
    titulo: "Relação de longo prazo",
    texto:
      "Nosso objetivo não é vender um carro, é ser a loja que você recomenda para a sua família.",
  },
];

export default async function PaginaSobre() {
  const [config, totalVeiculos, totalMarcas] = await Promise.all([
    obterConfiguracao(),
    prisma.veiculo.count({ where: { status: "DISPONIVEL" } }),
    prisma.marca.count({ where: { veiculos: { some: { status: "DISPONIVEL" } } } }),
  ]);

  return (
    <>
      <CabecalhoPagina
        titulo={`SOBRE A ${config.nomeLoja.toUpperCase()}`}
        descricao={
          config.slogan ||
          "Uma loja construída sobre procedência, transparência e atendimento de verdade."
        }
        migalhas={[{ label: "Sobre nós" }]}
      />

      <Secao>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow mb-3">Nossa história</p>
            <h2 className="font-display text-3xl font-black tracking-tight text-text">
              CARROS BEM ESCOLHIDOS, PESSOAS BEM ATENDIDAS
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-text-muted md:text-[15px]">
              <p>
                A {config.nomeLoja} nasceu da ideia de que comprar um carro
                seminovo não precisa ser um salto no escuro. Em vez de encher o
                pátio, escolhemos poucos veículos — e escolhemos bem.
              </p>
              <p>
                Todo carro que entra no nosso estoque passa por conferência de
                documentação, laudo cautelar e revisão mecânica. O que não passa
                nesse filtro simplesmente não é anunciado.
              </p>
              <p>
                Do outro lado, está o atendimento: um consultor acompanha você da
                primeira dúvida até a entrega das chaves — e continua disponível
                depois disso.
              </p>
            </div>
            <BotaoLink href="/estoque" tamanho="lg" className="mt-7">
              Conhecer o estoque
            </BotaoLink>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Numero valor={`${totalVeiculos}`} rotulo="veículos disponíveis" />
            <Numero valor={`${totalMarcas}`} rotulo="marcas no estoque" />
            <Numero valor="100%" rotulo="com laudo cautelar" />
            <Numero valor="7 dias" rotulo="garantia de satisfação" />
          </div>
        </div>
      </Secao>

      <Secao fundo="cinza">
        <TituloSecao
          sobrenome="No que acreditamos"
          titulo="NOSSOS COMPROMISSOS"
          descricao="Quatro princípios que valem para todo carro que sai da nossa loja."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALORES.map((v) => (
            <div
              key={v.titulo}
              className="rounded-[var(--radius)] border border-line bg-surface p-6"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand">
                <v.icone size={20} />
              </span>
              <h3 className="mt-4 text-[15px] font-bold text-text">{v.titulo}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
                {v.texto}
              </p>
            </div>
          ))}
        </div>
      </Secao>

      <Secao fundo="escuro">
        <div className="flex flex-col items-center gap-5 text-center">
          <TituloSecao
            titulo="VENHA NOS VISITAR"
            descricao={
              config.endereco
                ? `${config.endereco} — ${config.cidade}, ${config.estado}. ${config.horarioVendas}.`
                : "Agende uma visita e conheça os veículos pessoalmente."
            }
            invertido
          />
          <div className="flex flex-wrap justify-center gap-3">
            <BotaoLink href="/contato" tamanho="lg">
              Falar com um consultor
            </BotaoLink>
            <BotaoLink href="/estoque" variante="contornoClaro" tamanho="lg">
              Ver estoque
            </BotaoLink>
          </div>
        </div>
      </Secao>
    </>
  );
}

function Numero({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className="rounded-[var(--radius)] border border-line bg-surface-2 p-6 text-center">
      <p className="font-display text-4xl font-black tracking-tight text-brand">
        {valor}
      </p>
      <p className="mt-1.5 text-xs uppercase tracking-wide text-text-muted">
        {rotulo}
      </p>
    </div>
  );
}
