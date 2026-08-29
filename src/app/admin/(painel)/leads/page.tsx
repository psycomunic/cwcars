import Link from "next/link";
import { Search } from "lucide-react";
import { Campo, Selecao, Vazio } from "@/components/ui";
import { CartaoLead } from "@/components/admin/cartao-lead";
import { prisma } from "@/lib/prisma";
import { STATUS_LEAD, ORIGEM_LEAD, opcoes } from "@/lib/labels";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export default async function PaginaAdminLeads(
  props: PageProps<"/admin/leads">,
) {
  const params = await props.searchParams;
  const texto = (chave: string) => {
    const v = params[chave];
    const s = Array.isArray(v) ? v[0] : v;
    return s && s.trim() !== "" ? s.trim() : undefined;
  };

  const busca = texto("q");
  const status = texto("status");
  const origem = texto("origem");

  const where: Prisma.LeadWhereInput = {};
  if (status) where.status = status as Prisma.EnumStatusLeadFilter["equals"];
  if (origem) where.origem = origem as Prisma.EnumOrigemLeadFilter["equals"];
  if (busca) {
    where.OR = [
      { nome: { contains: busca, mode: "insensitive" } },
      { email: { contains: busca, mode: "insensitive" } },
      { telefone: { contains: busca, mode: "insensitive" } },
    ];
  }

  const [leads, porStatus] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { criadoEm: "desc" },
      take: 100,
      include: {
        veiculo: {
          select: {
            slug: true,
            anoModelo: true,
            marca: { select: { nome: true } },
            modelo: { select: { nome: true } },
          },
        },
      },
    }),
    prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const contagem = Object.fromEntries(
    porStatus.map((l) => [l.status, l._count._all]),
  );

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-text">Leads</h1>
        <p className="mt-1 text-sm text-text-muted">
          Contatos recebidos pelos formulários do site.
        </p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <FiltroStatus rotulo="Todos" href="/admin/leads" ativo={!status} />
        {opcoes(STATUS_LEAD).map((o) => (
          <FiltroStatus
            key={o.value}
            rotulo={`${o.label} (${contagem[o.value] ?? 0})`}
            href={`/admin/leads?status=${o.value}`}
            ativo={status === o.value}
          />
        ))}
      </div>

      <form
        action="/admin/leads"
        method="get"
        className="mb-5 flex flex-wrap gap-3 rounded-[var(--radius)] border border-line bg-surface p-4"
      >
        {status && <input type="hidden" name="status" value={status} />}
        <div className="relative min-w-56 flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <Campo
            name="q"
            defaultValue={busca ?? ""}
            placeholder="Buscar por nome, e-mail ou telefone"
            className="pl-9"
          />
        </div>
        <Selecao name="origem" defaultValue={origem ?? ""} className="w-56">
          <option value="">Todas as origens</option>
          {opcoes(ORIGEM_LEAD).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Selecao>
        <button
          type="submit"
          className="h-11 cursor-pointer rounded-[var(--radius-sm)] bg-ink px-5 text-sm font-semibold text-white"
        >
          Filtrar
        </button>
      </form>

      {leads.length === 0 ? (
        <Vazio
          titulo="Nenhum lead por aqui"
          descricao="Assim que alguém enviar um formulário no site, o contato aparece nesta lista."
        />
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <CartaoLead
              key={lead.id}
              lead={{
                id: lead.id,
                nome: lead.nome,
                email: lead.email,
                telefone: lead.telefone,
                mensagem: lead.mensagem,
                origem: lead.origem,
                status: lead.status,
                observacoes: lead.observacoes,
                criadoEm: lead.criadoEm.toISOString(),
                aceitaContato: lead.aceitaContato,
                cpf: lead.cpf,
                entradaCentavos: lead.entradaCentavos,
                parcelas: lead.parcelas,
                trocaPlaca: lead.trocaPlaca,
                trocaMarca: lead.trocaMarca,
                trocaModelo: lead.trocaModelo,
                trocaAno: lead.trocaAno,
                trocaKm: lead.trocaKm,
                veiculo: lead.veiculo
                  ? {
                      slug: lead.veiculo.slug,
                      titulo: `${lead.veiculo.marca.nome} ${lead.veiculo.modelo.nome} ${lead.veiculo.anoModelo}`,
                    }
                  : null,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}

function FiltroStatus({
  rotulo,
  href,
  ativo,
}: {
  rotulo: string;
  href: string;
  ativo: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        ativo
          ? "rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold text-white"
          : "rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:text-text"
      }
    >
      {rotulo}
    </Link>
  );
}
