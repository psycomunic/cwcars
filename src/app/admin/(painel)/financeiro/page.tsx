import { redirect } from "next/navigation";
import Link from "next/link";
import { Undo2 } from "lucide-react";
import { cancelarVenda } from "@/acoes/financeiro";
import {
  BotaoExcluirDespesa,
  CampoCustoAquisicao,
  FormularioDespesa,
  FormularioVenda,
} from "@/components/admin/formularios-financeiro";
import { Selo, Vazio } from "@/components/ui";
import { sessaoAtual } from "@/lib/auth";
import {
  calcularResultado,
  diasEmEstoque,
  inicioDoMes,
  inicioDoProximoMes,
  resumoDoPeriodo,
} from "@/lib/financeiro";
import { data, moeda, moedaExata } from "@/lib/format";
import { CATEGORIA_DESPESA } from "@/lib/labels";
import { pode } from "@/lib/permissoes";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** O veículo não tem campo de título: o nome se monta de marca, modelo e ano. */
function nomeDoVeiculo(v: {
  marca: { nome: string };
  modelo: { nome: string };
  anoModelo: number;
}) {
  return `${v.marca.nome} ${v.modelo.nome} ${v.anoModelo}`;
}

function porcentagem(valor: number | null) {
  if (valor === null) return "—";
  return `${valor.toFixed(1).replace(".", ",")}%`;
}

function Numero({
  rotulo,
  valor,
  detalhe,
  tom,
}: {
  rotulo: string;
  valor: string;
  detalhe?: string;
  tom?: "positivo" | "negativo";
}) {
  return (
    <div className="rounded-[var(--radius)] border border-line bg-surface p-4">
      <p className="text-xs font-medium text-text-muted">{rotulo}</p>
      <p
        className={
          tom === "positivo"
            ? "mt-1 text-xl font-extrabold text-success"
            : tom === "negativo"
              ? "mt-1 text-xl font-extrabold text-danger"
              : "mt-1 text-xl font-extrabold text-text"
        }
      >
        {valor}
      </p>
      {detalhe && <p className="mt-0.5 text-xs text-text-muted">{detalhe}</p>}
    </div>
  );
}

export default async function PaginaFinanceiro() {
  const sessao = await sessaoAtual();
  if (!sessao) redirect("/admin/login");
  if (!pode(sessao.papel, "verFinanceiro")) redirect("/admin");

  const de = inicioDoMes();
  const ate = inicioDoProximoMes();

  const [resumo, emEstoque, vendas, leadsAbertos, usuarios] = await Promise.all([
    resumoDoPeriodo(de, ate),
    prisma.veiculo.findMany({
      where: { status: { in: ["DISPONIVEL", "RESERVADO"] } },
      orderBy: { criadoEm: "asc" },
      select: {
        id: true,
        slug: true,
        versao: true,
        anoModelo: true,
        marca: { select: { nome: true } },
        modelo: { select: { nome: true } },
        precoCentavos: true,
        custoAquisicaoCentavos: true,
        criadoEm: true,
        status: true,
        despesas: {
          orderBy: { data: "desc" },
          select: {
            id: true,
            descricao: true,
            categoria: true,
            valorCentavos: true,
            data: true,
          },
        },
      },
    }),
    prisma.venda.findMany({
      orderBy: { vendidoEm: "desc" },
      take: 50,
      select: {
        id: true,
        valorCentavos: true,
        comissaoCentavos: true,
        vendidoEm: true,
        compradorNome: true,
        formaPagamento: true,
        vendedor: { select: { nome: true } },
        veiculo: {
          select: {
            id: true,
            versao: true,
            anoModelo: true,
            marca: { select: { nome: true } },
            modelo: { select: { nome: true } },
            criadoEm: true,
            custoAquisicaoCentavos: true,
            despesas: { select: { valorCentavos: true } },
          },
        },
      },
    }),
    prisma.lead.findMany({
      where: { status: { in: ["NOVO", "EM_ATENDIMENTO", "NEGOCIANDO"] } },
      orderBy: { criadoEm: "desc" },
      take: 100,
      select: { id: true, nome: true },
    }),
    prisma.usuario.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
  ]);

  const mesAtual = de.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  // quanto há de dinheiro parado no pátio, a preço de custo
  const capitalParado = emEstoque.reduce((total, v) => {
    const r = calcularResultado({
      custoAquisicaoCentavos: v.custoAquisicaoCentavos,
      despesas: v.despesas,
    });
    return total + r.custoTotalCentavos;
  }, 0);
  const semCusto = emEstoque.filter(
    (v) => v.custoAquisicaoCentavos === null,
  ).length;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-text">
          Financeiro
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Custo, venda e margem de cada veículo. Visível apenas para
          administradores.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold capitalize text-text">
          {mesAtual}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Numero
            rotulo="Vendas"
            valor={String(resumo.vendas)}
            detalhe={
              resumo.diasMedioEmEstoque !== null
                ? `${resumo.diasMedioEmEstoque} dias médios em estoque`
                : undefined
            }
          />
          <Numero rotulo="Receita" valor={moeda(resumo.receitaCentavos)} />
          <Numero
            rotulo="Custo + comissões"
            valor={moeda(resumo.custoCentavos + resumo.comissoesCentavos)}
            detalhe={`${moeda(resumo.comissoesCentavos)} em comissões`}
          />
          <Numero
            rotulo="Lucro"
            valor={moeda(resumo.lucroCentavos)}
            detalhe={`Margem ${porcentagem(resumo.margem)}`}
            tom={resumo.lucroCentavos >= 0 ? "positivo" : "negativo"}
          />
        </div>

        {resumo.vendasComCustoIncompleto > 0 && (
          <p className="mt-3 rounded-[var(--radius-sm)] border border-warning/30 bg-warning/8 px-3.5 py-2.5 text-[13px] text-text">
            <strong>{resumo.vendasComCustoIncompleto}</strong>{" "}
            {resumo.vendasComCustoIncompleto === 1 ? "venda" : "vendas"} do mês
            sem custo de aquisição informado. O lucro acima está otimista.
          </p>
        )}
      </section>

      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-sm font-bold text-text">
            Em estoque ({emEstoque.length})
          </h2>
          <p className="text-xs text-text-muted">
            {moeda(capitalParado)} em custo parado
            {semCusto > 0 && ` · ${semCusto} sem custo informado`}
          </p>
        </div>

        {emEstoque.length === 0 ? (
          <Vazio
            titulo="Nenhum veículo em estoque"
            descricao="Veículos disponíveis ou reservados aparecem aqui."
          />
        ) : (
          <div className="space-y-3">
            {emEstoque.map((veiculo) => {
              const resultado = calcularResultado({
                custoAquisicaoCentavos: veiculo.custoAquisicaoCentavos,
                despesas: veiculo.despesas,
              });
              const dias = diasEmEstoque(veiculo.criadoEm);
              const previsto =
                veiculo.precoCentavos - resultado.custoTotalCentavos;

              return (
                <article
                  key={veiculo.id}
                  className="rounded-[var(--radius)] border border-line bg-surface p-5"
                >
                  <header className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/veiculos/${veiculo.id}`}
                        className="text-[15px] font-bold text-text hover:text-brand"
                      >
                        {nomeDoVeiculo(veiculo)}
                      </Link>
                      <p className="mt-0.5 text-xs text-text-muted">
                        Anunciado por {moeda(veiculo.precoCentavos)} · {dias} dias
                        em estoque
                        {veiculo.status === "RESERVADO" && " · reservado"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-muted">Margem prevista</p>
                      <p
                        className={
                          previsto >= 0
                            ? "text-[15px] font-bold text-success"
                            : "text-[15px] font-bold text-danger"
                        }
                      >
                        {moeda(previsto)}
                      </p>
                    </div>
                  </header>

                  <div className="mt-4 flex flex-wrap items-end gap-4 border-t border-line pt-4">
                    <CampoCustoAquisicao
                      veiculoId={veiculo.id}
                      valorCentavos={veiculo.custoAquisicaoCentavos}
                    />
                    <div>
                      <p className="text-xs font-medium text-text-muted">Gastos</p>
                      <p className="mt-1 text-sm font-semibold text-text">
                        {moedaExata(resultado.despesasCentavos)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-text-muted">
                        Custo total
                      </p>
                      <p className="mt-1 text-sm font-semibold text-text">
                        {moedaExata(resultado.custoTotalCentavos)}
                      </p>
                    </div>
                    <div className="ml-auto flex flex-wrap items-center gap-2">
                      <FormularioVenda
                        veiculoId={veiculo.id}
                        precoAnunciadoCentavos={veiculo.precoCentavos}
                        leads={leadsAbertos}
                        vendedores={usuarios}
                      />
                    </div>
                  </div>

                  {veiculo.despesas.length > 0 && (
                    <ul className="mt-3 space-y-1 border-t border-line pt-3">
                      {veiculo.despesas.map((despesa) => (
                        <li
                          key={despesa.id}
                          className="flex flex-wrap items-center gap-2 text-[13px]"
                        >
                          <span className="text-text">{despesa.descricao}</span>
                          <Selo tom="neutro">
                            {CATEGORIA_DESPESA[despesa.categoria]}
                          </Selo>
                          <span className="text-text-muted">
                            {data(despesa.data)}
                          </span>
                          <span className="font-semibold text-text">
                            {moedaExata(despesa.valorCentavos)}
                          </span>
                          <BotaoExcluirDespesa
                            id={despesa.id}
                            descricao={despesa.descricao}
                            valorCentavos={despesa.valorCentavos}
                          />
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-3">
                    <FormularioDespesa veiculoId={veiculo.id} />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-text">
          Vendas registradas ({vendas.length})
        </h2>

        {vendas.length === 0 ? (
          <Vazio
            titulo="Nenhuma venda registrada"
            descricao="Registre a venda pelo cartão do veículo em estoque."
          />
        ) : (
          <div className="overflow-x-auto rounded-[var(--radius)] border border-line bg-surface">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-text-muted">
                  <th className="px-4 py-3 font-medium">Veículo</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Comprador</th>
                  <th className="px-4 py-3 font-medium">Vendedor</th>
                  <th className="px-4 py-3 text-right font-medium">Venda</th>
                  <th className="px-4 py-3 text-right font-medium">Custo</th>
                  <th className="px-4 py-3 text-right font-medium">Lucro</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {vendas.map((venda) => {
                  const r = calcularResultado({
                    custoAquisicaoCentavos: venda.veiculo.custoAquisicaoCentavos,
                    despesas: venda.veiculo.despesas,
                    venda,
                  });
                  return (
                    <tr key={venda.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/veiculos/${venda.veiculo.id}`}
                          className="font-medium text-text hover:text-brand"
                        >
                          {nomeDoVeiculo(venda.veiculo)}
                        </Link>
                        {r.custoIncompleto && (
                          <span className="ml-2 text-xs text-warning">
                            sem custo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {data(venda.vendidoEm)}
                      </td>
                      <td className="px-4 py-3 text-text">{venda.compradorNome}</td>
                      <td className="px-4 py-3 text-text-muted">
                        {venda.vendedor?.nome ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-text">
                        {moeda(venda.valorCentavos)}
                      </td>
                      <td className="px-4 py-3 text-right text-text-muted">
                        {moeda(r.custoTotalCentavos)}
                      </td>
                      <td
                        className={
                          r.lucroCentavos >= 0
                            ? "px-4 py-3 text-right font-semibold text-success"
                            : "px-4 py-3 text-right font-semibold text-danger"
                        }
                      >
                        {moeda(r.lucroCentavos)}
                        <span className="ml-1 text-xs font-normal text-text-muted">
                          {porcentagem(r.margem)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <form action={cancelarVenda}>
                          <input type="hidden" name="id" value={venda.id} />
                          <button
                            type="submit"
                            title="Desfazer venda e devolver ao estoque"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
                          >
                            <Undo2 size={14} />
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
