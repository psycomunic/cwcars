import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  Headset,
  KeyRound,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { BotaoLink, Secao, TituloSecao, Vazio } from "@/components/ui";
import { BuscaRapida } from "@/components/site/busca-rapida";
import { DestaquesAbas } from "@/components/site/destaques-abas";
import { LogoMarca } from "@/components/logo-marca";
import { prisma } from "@/lib/prisma";
import {
  opcoesDeFiltro,
  veiculosDestaque,
  veiculosRecentes,
} from "@/lib/veiculos";
import { obterConfiguracao } from "@/lib/configuracao";

export const dynamic = "force-dynamic";

const BENEFICIOS = [
  {
    icone: ShieldCheck,
    titulo: "Procedência garantida",
    texto: "Todo veículo passa por laudo cautelar e revisão completa antes de entrar no estoque.",
  },
  {
    icone: Tag,
    titulo: "Preço justo",
    texto: "Trabalhamos com preços alinhados à tabela FIPE e à média real de mercado.",
  },
  {
    icone: CircleDollarSign,
    titulo: "Financiamento flexível",
    texto: "Aprovação rápida, entrada facilitada e parcelas que cabem no seu bolso.",
  },
  {
    icone: Headset,
    titulo: "Atendimento de verdade",
    texto: "Da primeira visita à entrega das chaves, um consultor acompanha você.",
  },
];

export default async function PaginaInicial() {
  const [destaques, recentes, opcoes, marcas, config] = await Promise.all([
    veiculosDestaque(8),
    veiculosRecentes(8),
    opcoesDeFiltro(),
    prisma.marca.findMany({
      where: { destaque: true },
      orderBy: { ordem: "asc" },
      select: { nome: true, slug: true, logoUrl: true },
    }),
    obterConfiguracao(),
  ]);

  // os marcados como destaque vêm primeiro; o restante da vitrine é completado
  // com os mais recentes, para a home nunca ficar com poucos carros
  const vitrine = [
    ...destaques,
    ...recentes.filter((r) => !destaques.some((d) => d.id === r.id)),
  ].slice(0, 8);

  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="relative isolate flex min-h-[540px] flex-col justify-center overflow-hidden bg-ink md:min-h-[620px]">
        {/* vídeo de fundo — decorativo, sem áudio; escondido em prefers-reduced-motion */}
        <video
          className="video-hero absolute inset-0 -z-10 h-full w-full object-cover"
          src="/hero-2.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
        />
        {/* escurecimento só na faixa do texto; some por completo antes da metade
            direita, deixando o vídeo limpo */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(95deg,rgba(15,17,21,0.96)_0%,rgba(15,17,21,0.9)_20%,rgba(15,17,21,0.6)_36%,rgba(15,17,21,0.2)_48%,rgba(15,17,21,0)_58%)]"
        />
        <div className="container-page relative pb-28 pt-16 md:pb-32 md:pt-24">
          <div className="max-w-xl">
            <p className="eyebrow">Carros excepcionais.</p>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">
              Experiência excepcional.
            </p>
            <h1 className="font-display text-4xl font-black leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              ENCONTRE O
              <br />
              <span className="text-brand">CARRO CERTO</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/70 md:text-base">
              Estoque selecionado de veículos novos e seminovos, com procedência
              verificada e condições de financiamento sob medida.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <BotaoLink href="/estoque" tamanho="lg">
                Ver estoque
              </BotaoLink>
              <BotaoLink href="/financiamento" variante="contornoClaro" tamanho="lg">
                Simular financiamento
              </BotaoLink>
            </div>
          </div>
        </div>

        {/* barra de busca sobreposta */}
        <div className="container-page relative -mb-16 translate-y-[-3.5rem] md:-mb-20 md:translate-y-[-4.5rem]">
          <BuscaRapida
            opcoes={{
              marcas: opcoes.marcas.map((m) => ({ nome: m.nome, slug: m.slug })),
              modelos: opcoes.modelos,
              precoMax: opcoes.precoMax,
            }}
          />
        </div>
      </section>

      {/* ------------------------------------------------------ destaques */}
      <Secao className="pt-20 md:pt-24">
        <TituloSecao
          sobrenome="Nosso estoque"
          titulo="DESTAQUES DA SEMANA"
          descricao="Uma seleção dos veículos com melhor procura e melhor condição de negociação."
        />
        {vitrine.length === 0 ? (
          <Vazio
            titulo="Estoque em atualização"
            descricao="Cadastre veículos no painel administrativo para que apareçam aqui."
            acao={<BotaoLink href="/admin">Ir para o painel</BotaoLink>}
          />
        ) : (
          <>
            <DestaquesAbas veiculos={vitrine} />
            <div className="mt-10 flex justify-center">
              <BotaoLink href="/estoque" variante="contorno" tamanho="lg">
                Ver todo o estoque
                <ArrowRight size={16} />
              </BotaoLink>
            </div>
          </>
        )}
      </Secao>

      {/* ----------------------------------------------------- benefícios */}
      <section className="bg-ink py-12">
        <div className="container-page grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFICIOS.map((b) => (
            <div key={b.titulo} className="flex gap-3.5">
              <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                <b.icone size={19} />
              </span>
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-wide text-white">
                  {b.titulo}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/60">
                  {b.texto}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------- financiamento/troca */}
      <section className="grid md:grid-cols-2">
        <PainelAcao
          eyebrow="Financiamento fácil"
          titulo={
            <>
              DIRIJA AGORA,
              <br />
              PAGUE DO SEU JEITO
            </>
          }
          texto="Simule em minutos, compare planos e escolha as parcelas que cabem no seu orçamento."
          href="/financiamento"
          rotuloBotao="Simular agora"
          icone={CircleDollarSign}
          claro
        />
        <PainelAcao
          eyebrow="Avalie seu usado"
          titulo={
            <>
              QUANTO VALE
              <br />O SEU CARRO?
            </>
          }
          texto="Receba uma proposta justa de mercado para o seu veículo em poucos cliques e use como entrada."
          href="/avaliar-troca"
          rotuloBotao="Avaliar meu carro"
          icone={KeyRound}
        />
      </section>

      {/* --------------------------------------------------------- marcas */}
      {marcas.length > 0 && (
        <Secao fundo="claro" className="py-12 md:py-14">
          <p className="mb-9 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
            Trabalhamos com as principais marcas
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-10">
            {marcas.map((m) => (
              <Link
                key={m.slug}
                href={`/estoque?marca=${m.slug}`}
                title={`Ver ${m.nome} no estoque`}
                className="group inline-flex flex-col items-center gap-3"
              >
                <span className="flex h-16 items-center">
                  <LogoMarca
                    nome={m.nome}
                    slug={m.slug}
                    logoUrl={m.logoUrl}
                    className="h-14"
                  />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-text-muted transition-colors group-hover:text-text">
                  {m.nome}
                </span>
              </Link>
            ))}
          </div>
        </Secao>
      )}

      {/* ------------------------------------------------------- chamada */}
      <Secao fundo="cinza">
        <div className="flex flex-col items-center gap-6 rounded-[var(--radius-lg)] bg-surface p-10 text-center shadow-[var(--shadow-card)] md:flex-row md:justify-between md:text-left">
          <div className="flex items-start gap-4">
            <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand md:inline-flex">
              <BadgeCheck size={22} />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-text md:text-2xl">
                Ainda com dúvida sobre qual carro escolher?
              </h2>
              <p className="mt-1.5 text-sm text-text-muted">
                Fale com um consultor da {config.nomeLoja} e receba indicações
                conforme o seu perfil e o seu orçamento.
              </p>
            </div>
          </div>
          <BotaoLink href="/contato" tamanho="lg" className="shrink-0">
            Falar com um consultor
          </BotaoLink>
        </div>
      </Secao>
    </>
  );
}

function PainelAcao({
  eyebrow,
  titulo,
  texto,
  href,
  rotuloBotao,
  icone: Icone,
  claro = false,
}: {
  eyebrow: string;
  titulo: React.ReactNode;
  texto: string;
  href: string;
  rotuloBotao: string;
  icone: React.ComponentType<{ size?: number; className?: string }>;
  claro?: boolean;
}) {
  return (
    <div
      className={
        claro
          ? "relative overflow-hidden bg-surface-2 px-6 py-14 md:px-12"
          : "relative overflow-hidden bg-ink-2 px-6 py-14 text-white md:px-12"
      }
    >
      <Icone
        size={180}
        className={
          claro
            ? "pointer-events-none absolute -right-6 -top-6 text-ink/[0.04]"
            : "pointer-events-none absolute -right-6 -top-6 text-white/[0.04]"
        }
      />
      <div className="relative max-w-sm">
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h2
          className={
            claro
              ? "font-display text-2xl font-black leading-tight text-text md:text-3xl"
              : "font-display text-2xl font-black leading-tight text-white md:text-3xl"
          }
        >
          {titulo}
        </h2>
        <p
          className={
            claro
              ? "mt-3 text-sm text-text-muted"
              : "mt-3 text-sm text-white/65"
          }
        >
          {texto}
        </p>
        <BotaoLink href={href} className="mt-6">
          {rotuloBotao}
        </BotaoLink>
      </div>
    </div>
  );
}
