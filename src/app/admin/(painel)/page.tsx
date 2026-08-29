import Link from "next/link";
import { ArrowUpRight, Car, DollarSign, Eye, Inbox, Plus } from "lucide-react";
import { BotaoLink, Selo } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { dataHora, moeda, numero } from "@/lib/format";
import { ORIGEM_LEAD, STATUS_LEAD } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function PainelInicial() {
  const [
    totalDisponivel,
    totalVendido,
    totalRascunho,
    leadsNovos,
    leadsTotal,
    agregado,
    ultimosLeads,
    maisVistos,
  ] = await Promise.all([
    prisma.veiculo.count({ where: { status: "DISPONIVEL" } }),
    prisma.veiculo.count({ where: { status: "VENDIDO" } }),
    prisma.veiculo.count({ where: { status: "RASCUNHO" } }),
    prisma.lead.count({ where: { status: "NOVO" } }),
    prisma.lead.count(),
    prisma.veiculo.aggregate({
      where: { status: "DISPONIVEL" },
      _sum: { precoCentavos: true, visitas: true },
    }),
    prisma.lead.findMany({
      orderBy: { criadoEm: "desc" },
      take: 6,
      include: {
        veiculo: {
          select: {
            slug: true,
            marca: { select: { nome: true } },
            modelo: { select: { nome: true } },
          },
        },
      },
    }),
    prisma.veiculo.findMany({
      where: { status: "DISPONIVEL" },
      orderBy: { visitas: "desc" },
      take: 5,
      select: {
        id: true,
        slug: true,
        visitas: true,
        precoCentavos: true,
        anoModelo: true,
        marca: { select: { nome: true } },
        modelo: { select: { nome: true } },
      },
    }),
  ]);

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-text">
            Visão geral
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Situação do estoque e dos contatos recebidos.
          </p>
        </div>
        <BotaoLink href="/admin/veiculos/novo">
          <Plus size={16} />
          Cadastrar veículo
        </BotaoLink>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metrica
          icone={Car}
          rotulo="Veículos disponíveis"
          valor={numero(totalDisponivel)}
          detalhe={`${totalRascunho} em rascunho`}
        />
        <Metrica
          icone={DollarSign}
          rotulo="Valor do estoque"
          valor={moeda(agregado._sum.precoCentavos ?? 0)}
          detalhe={`${totalVendido} vendidos`}
        />
        <Metrica
          icone={Inbox}
          rotulo="Leads novos"
          valor={numero(leadsNovos)}
          detalhe={`${leadsTotal} no total`}
          destaque={leadsNovos > 0}
        />
        <Metrica
          icone={Eye}
          rotulo="Visitas às páginas"
          valor={numero(agregado._sum.visitas ?? 0)}
          detalhe="Somatório do estoque ativo"
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Cartao
          titulo="Últimos leads"
          acao={{ href: "/admin/leads", label: "Ver todos" }}
        >
          {ultimosLeads.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-text-muted">
              Nenhum contato recebido ainda.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {ultimosLeads.map((lead) => (
                <li key={lead.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text">
                      {lead.nome}
                    </p>
                    <p className="truncate text-xs text-text-muted">
                      {ORIGEM_LEAD[lead.origem]}
                      {lead.veiculo &&
                        ` · ${lead.veiculo.marca.nome} ${lead.veiculo.modelo.nome}`}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Selo tom={lead.status === "NOVO" ? "marca" : "neutro"}>
                      {STATUS_LEAD[lead.status]}
                    </Selo>
                    <p className="mt-1 text-[11px] text-text-muted">
                      {dataHora(lead.criadoEm)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Cartao>

        <Cartao
          titulo="Mais visitados"
          acao={{ href: "/admin/veiculos", label: "Ver estoque" }}
        >
          {maisVistos.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-text-muted">
              Cadastre veículos para ver as estatísticas.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {maisVistos.map((v) => (
                <li key={v.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/veiculo/${v.slug}`}
                      target="_blank"
                      className="flex items-center gap-1 truncate text-sm font-semibold text-text hover:text-brand"
                    >
                      {v.marca.nome} {v.modelo.nome} {v.anoModelo}
                      <ArrowUpRight size={13} className="shrink-0 opacity-50" />
                    </Link>
                    <p className="text-xs text-text-muted">
                      {moeda(v.precoCentavos)}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-text-muted">
                    <Eye size={13} />
                    {numero(v.visitas)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Cartao>
      </div>
    </>
  );
}

function Metrica({
  icone: Icone,
  rotulo,
  valor,
  detalhe,
  destaque = false,
}: {
  icone: React.ComponentType<{ size?: number; className?: string }>;
  rotulo: string;
  valor: string;
  detalhe?: string;
  destaque?: boolean;
}) {
  return (
    <div className="rounded-[var(--radius)] border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          {rotulo}
        </p>
        <span
          className={
            destaque
              ? "inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white"
              : "inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-text-muted"
          }
        >
          <Icone size={15} />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-black tracking-tight text-text">
        {valor}
      </p>
      {detalhe && <p className="mt-1 text-xs text-text-muted">{detalhe}</p>}
    </div>
  );
}

function Cartao({
  titulo,
  acao,
  children,
}: {
  titulo: string;
  acao?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[var(--radius)] border border-line bg-surface">
      <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 className="text-sm font-bold text-text">{titulo}</h2>
        {acao && (
          <Link
            href={acao.href}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
          >
            {acao.label}
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}
