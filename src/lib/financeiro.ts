import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * As contas do financeiro, num lugar só.
 *
 * Tudo em centavos, como o resto do sistema — dinheiro nunca vira float aqui.
 * A margem de um veículo é sempre a mesma conta:
 *
 *   lucro = venda − aquisição − despesas − comissão
 *
 * Custo de aquisição ausente (veículo antigo, cadastrado antes deste módulo)
 * conta como zero. O lucro sai inflado nesse caso, e por isso as telas marcam
 * o veículo como "custo não informado" em vez de fingir que o número fecha.
 */

export type ResultadoVeiculo = {
  aquisicaoCentavos: number;
  despesasCentavos: number;
  comissaoCentavos: number;
  /** aquisição + despesas + comissão */
  custoTotalCentavos: number;
  vendaCentavos: number;
  lucroCentavos: number;
  /** lucro sobre a venda, em porcentagem. `null` quando não houve venda. */
  margem: number | null;
  /** o custo de aquisição nunca foi preenchido, então a conta está otimista */
  custoIncompleto: boolean;
};

export function calcularResultado(entrada: {
  custoAquisicaoCentavos?: number | null;
  despesas: Array<{ valorCentavos: number }>;
  venda?: { valorCentavos: number; comissaoCentavos: number } | null;
}): ResultadoVeiculo {
  const aquisicaoCentavos = entrada.custoAquisicaoCentavos ?? 0;
  const despesasCentavos = entrada.despesas.reduce(
    (total, d) => total + d.valorCentavos,
    0,
  );
  const comissaoCentavos = entrada.venda?.comissaoCentavos ?? 0;
  const vendaCentavos = entrada.venda?.valorCentavos ?? 0;

  const custoTotalCentavos =
    aquisicaoCentavos + despesasCentavos + comissaoCentavos;
  const lucroCentavos = vendaCentavos - custoTotalCentavos;

  return {
    aquisicaoCentavos,
    despesasCentavos,
    comissaoCentavos,
    custoTotalCentavos,
    vendaCentavos,
    lucroCentavos,
    margem: vendaCentavos > 0 ? (lucroCentavos / vendaCentavos) * 100 : null,
    custoIncompleto:
      entrada.custoAquisicaoCentavos === null ||
      entrada.custoAquisicaoCentavos === undefined,
  };
}

/** Dias entre a entrada no estoque e a venda — ou até hoje, se ainda não vendeu. */
export function diasEmEstoque(
  entrada: Date,
  saida?: Date | null,
): number {
  const fim = saida ?? new Date();
  const dia = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.round((fim.getTime() - entrada.getTime()) / dia));
}

export type ResumoPeriodo = {
  vendas: number;
  receitaCentavos: number;
  custoCentavos: number;
  comissoesCentavos: number;
  lucroCentavos: number;
  margem: number | null;
  ticketMedioCentavos: number;
  diasMedioEmEstoque: number | null;
  /** vendas cujo veículo não tem custo de aquisição preenchido */
  vendasComCustoIncompleto: number;
};

/** Consolida as vendas de um intervalo. `ate` é exclusivo. */
export async function resumoDoPeriodo(
  de: Date,
  ate: Date,
): Promise<ResumoPeriodo> {
  const vendas = await prisma.venda.findMany({
    where: { vendidoEm: { gte: de, lt: ate } },
    select: {
      valorCentavos: true,
      comissaoCentavos: true,
      vendidoEm: true,
      veiculo: {
        select: {
          custoAquisicaoCentavos: true,
          criadoEm: true,
          despesas: { select: { valorCentavos: true } },
        },
      },
    },
  });

  let receitaCentavos = 0;
  let custoCentavos = 0;
  let comissoesCentavos = 0;
  let somaDias = 0;
  let vendasComCustoIncompleto = 0;

  for (const venda of vendas) {
    const resultado = calcularResultado({
      custoAquisicaoCentavos: venda.veiculo.custoAquisicaoCentavos,
      despesas: venda.veiculo.despesas,
      venda,
    });
    receitaCentavos += resultado.vendaCentavos;
    custoCentavos += resultado.aquisicaoCentavos + resultado.despesasCentavos;
    comissoesCentavos += resultado.comissaoCentavos;
    somaDias += diasEmEstoque(venda.veiculo.criadoEm, venda.vendidoEm);
    if (resultado.custoIncompleto) vendasComCustoIncompleto++;
  }

  const lucroCentavos = receitaCentavos - custoCentavos - comissoesCentavos;

  return {
    vendas: vendas.length,
    receitaCentavos,
    custoCentavos,
    comissoesCentavos,
    lucroCentavos,
    margem: receitaCentavos > 0 ? (lucroCentavos / receitaCentavos) * 100 : null,
    ticketMedioCentavos: vendas.length
      ? Math.round(receitaCentavos / vendas.length)
      : 0,
    diasMedioEmEstoque: vendas.length ? Math.round(somaDias / vendas.length) : null,
    vendasComCustoIncompleto,
  };
}

/** Primeiro instante do mês de uma data. */
export function inicioDoMes(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** Primeiro instante do mês seguinte — usado como limite exclusivo. */
export function inicioDoProximoMes(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
}
