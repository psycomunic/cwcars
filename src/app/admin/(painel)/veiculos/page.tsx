import Link from "next/link";
import { Eye, Pencil, Plus, Star, Search } from "lucide-react";
import { alternarDestaque } from "@/acoes/veiculos";
import { BotaoLink, Campo, Selo, Selecao, Vazio } from "@/components/ui";
import { FotoVeiculo } from "@/components/foto-veiculo";
import { BotaoExcluirVeiculo } from "@/components/admin/botao-excluir-veiculo";
import { prisma } from "@/lib/prisma";
import { km, moeda } from "@/lib/format";
import { CAMBIO, STATUS_VEICULO, opcoes } from "@/lib/labels";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const TONS: Record<string, "sucesso" | "aviso" | "neutro" | "perigo"> = {
  DISPONIVEL: "sucesso",
  RESERVADO: "aviso",
  RASCUNHO: "neutro",
  VENDIDO: "perigo",
};

export default async function PaginaAdminVeiculos(
  props: PageProps<"/admin/veiculos">,
) {
  const params = await props.searchParams;
  const texto = (chave: string) => {
    const v = params[chave];
    const s = Array.isArray(v) ? v[0] : v;
    return s && s.trim() !== "" ? s.trim() : undefined;
  };

  const busca = texto("q");
  const status = texto("status");
  const salvo = texto("salvo");

  const where: Prisma.VeiculoWhereInput = {};
  if (status) where.status = status as Prisma.EnumStatusVeiculoFilter["equals"];
  if (busca) {
    where.OR = [
      { versao: { contains: busca, mode: "insensitive" } },
      { cor: { contains: busca, mode: "insensitive" } },
      { placa: { contains: busca, mode: "insensitive" } },
      { marca: { nome: { contains: busca, mode: "insensitive" } } },
      { modelo: { nome: { contains: busca, mode: "insensitive" } } },
    ];
  }

  const veiculos = await prisma.veiculo.findMany({
    where,
    orderBy: [{ criadoEm: "desc" }],
    include: {
      marca: { select: { nome: true } },
      modelo: { select: { nome: true } },
      imagens: { orderBy: { ordem: "asc" }, take: 1 },
      _count: { select: { leads: true } },
    },
  });

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-text">
            Veículos
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {veiculos.length} {veiculos.length === 1 ? "registro" : "registros"}
            {status || busca ? " com os filtros atuais" : " no total"}.
          </p>
        </div>
        <BotaoLink href="/admin/veiculos/novo">
          <Plus size={16} />
          Cadastrar veículo
        </BotaoLink>
      </div>

      {salvo && (
        <p className="mb-5 rounded-[var(--radius-sm)] border border-success/25 bg-success/8 px-4 py-3 text-sm font-medium text-success">
          Veículo salvo com sucesso.
        </p>
      )}

      <form
        action="/admin/veiculos"
        method="get"
        className="mb-5 flex flex-wrap gap-3 rounded-[var(--radius)] border border-line bg-surface p-4"
      >
        <div className="relative min-w-56 flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <Campo
            name="q"
            defaultValue={busca ?? ""}
            placeholder="Buscar por marca, modelo, versão ou placa"
            className="pl-9"
          />
        </div>
        <Selecao name="status" defaultValue={status ?? ""} className="w-48">
          <option value="">Todos os status</option>
          {opcoes(STATUS_VEICULO).map((o) => (
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

      {veiculos.length === 0 ? (
        <Vazio
          titulo="Nenhum veículo encontrado"
          descricao="Cadastre o primeiro veículo para que ele apareça no site."
          acao={
            <BotaoLink href="/admin/veiculos/novo">Cadastrar veículo</BotaoLink>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius)] border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-2 text-left text-[11px] uppercase tracking-wider text-text-muted">
                  <th className="px-4 py-3 font-bold">Veículo</th>
                  <th className="px-4 py-3 font-bold">Preço</th>
                  <th className="px-4 py-3 font-bold">KM</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Leads</th>
                  <th className="px-4 py-3 text-right font-bold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {veiculos.map((v) => (
                  <tr key={v.id} className="hover:bg-surface-2/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-surface-3">
                          <FotoVeiculo
                            url={v.imagens[0]?.url}
                            alt={v.imagens[0]?.alt || v.versao}
                            sizes="64px"
                          />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-text">
                            {v.marca.nome} {v.modelo.nome}{" "}
                            <span className="font-normal text-text-muted">
                              {v.anoFabricacao}/{v.anoModelo}
                            </span>
                          </p>
                          <p className="truncate text-xs text-text-muted">
                            {v.versao} · {CAMBIO[v.cambio]} · {v.cor}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-text">
                      {moeda(v.precoCentavos)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-text-muted">
                      {km(v.quilometragem)}
                    </td>
                    <td className="px-4 py-3">
                      <Selo tom={TONS[v.status]}>{STATUS_VEICULO[v.status]}</Selo>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {v._count.leads}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <form action={alternarDestaque}>
                          <input type="hidden" name="id" value={v.id} />
                          <button
                            type="submit"
                            title={
                              v.destaque
                                ? "Remover dos destaques"
                                : "Colocar em destaque"
                            }
                            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-text-muted transition-colors hover:bg-surface-2"
                          >
                            <Star
                              size={16}
                              className={
                                v.destaque
                                  ? "fill-warning text-warning"
                                  : undefined
                              }
                            />
                          </button>
                        </form>

                        <Link
                          href={`/veiculo/${v.slug}`}
                          target="_blank"
                          title="Ver no site"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-text-muted transition-colors hover:bg-surface-2"
                        >
                          <Eye size={16} />
                        </Link>

                        <Link
                          href={`/admin/veiculos/${v.id}`}
                          title="Editar"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-text-muted transition-colors hover:bg-surface-2"
                        >
                          <Pencil size={16} />
                        </Link>

                        <BotaoExcluirVeiculo
                          id={v.id}
                          nome={`${v.marca.nome} ${v.modelo.nome}`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
