"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { exigirPermissao } from "@/lib/auth";
import { paraCentavos } from "@/lib/format";
import { errosDoZod } from "@/lib/validacao";
import type { EstadoFormulario } from "@/lib/estados-formulario";

const CATEGORIAS = [
  "DOCUMENTACAO",
  "MECANICA",
  "FUNILARIA",
  "ESTETICA",
  "TRANSPORTE",
  "COMISSAO_COMPRA",
  "OUTROS",
] as const;

/** Lê um campo de dinheiro do formulário, em reais, e devolve centavos. */
const dinheiro = (obrigatorio: string) =>
  z
    .string()
    .transform((v) => paraCentavos(v))
    .refine((c) => c !== null && c >= 0, obrigatorio)
    .transform((c) => c as number);

function atualizar(veiculoId?: string) {
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin");
  revalidatePath("/admin/veiculos");
  if (veiculoId) revalidatePath(`/admin/veiculos/${veiculoId}`);
}

/* ------------------------------------------------------------------ despesas */

const esquemaDespesa = z.object({
  veiculoId: z.string().min(1),
  descricao: z.string().trim().min(2, "Descreva o gasto").max(120),
  categoria: z.enum(CATEGORIAS),
  valor: dinheiro("Informe um valor válido"),
  data: z.string().optional(),
});

export async function lancarDespesa(
  _anterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const sessao = await exigirPermissao("verFinanceiro");

  const dados = esquemaDespesa.safeParse({
    veiculoId: formData.get("veiculoId"),
    descricao: formData.get("descricao"),
    categoria: formData.get("categoria"),
    valor: formData.get("valor"),
    data: formData.get("data"),
  });
  if (!dados.success) return { ok: false, erros: errosDoZod(dados.error) };

  await prisma.despesaVeiculo.create({
    data: {
      veiculoId: dados.data.veiculoId,
      descricao: dados.data.descricao,
      categoria: dados.data.categoria,
      valorCentavos: dados.data.valor,
      data: dados.data.data ? new Date(dados.data.data) : new Date(),
      usuarioId: sessao.id,
    },
  });

  atualizar(dados.data.veiculoId);
  return { ok: true, mensagem: "Gasto lançado." };
}

export async function excluirDespesa(formData: FormData) {
  await exigirPermissao("verFinanceiro");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const despesa = await prisma.despesaVeiculo
    .delete({ where: { id }, select: { veiculoId: true } })
    .catch(() => null);

  atualizar(despesa?.veiculoId);
}

/* -------------------------------------------------------------------- vendas */

const esquemaVenda = z.object({
  veiculoId: z.string().min(1),
  valor: dinheiro("Informe o valor da venda"),
  comissao: dinheiro("Informe a comissão (use 0 se não houver)"),
  vendidoEm: z.string().optional(),
  compradorNome: z.string().trim().min(2, "Informe o nome do comprador").max(120),
  compradorTelefone: z.string().trim().max(40).optional().default(""),
  formaPagamento: z.string().trim().max(60).optional().default(""),
  observacoes: z.string().trim().max(1000).optional().default(""),
  leadId: z.string().optional(),
  vendedorId: z.string().optional(),
});

/**
 * Registra a venda e marca o veículo como VENDIDO na mesma transação — os dois
 * juntos, ou nenhum. Um veículo vendido que continua anunciado como disponível
 * é pior que um erro na tela.
 */
export async function registrarVenda(
  _anterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const sessao = await exigirPermissao("verFinanceiro");

  const dados = esquemaVenda.safeParse({
    veiculoId: formData.get("veiculoId"),
    valor: formData.get("valor"),
    comissao: formData.get("comissao") || "0",
    vendidoEm: formData.get("vendidoEm"),
    compradorNome: formData.get("compradorNome"),
    compradorTelefone: formData.get("compradorTelefone") ?? "",
    formaPagamento: formData.get("formaPagamento") ?? "",
    observacoes: formData.get("observacoes") ?? "",
    leadId: formData.get("leadId") || undefined,
    vendedorId: formData.get("vendedorId") || undefined,
  });
  if (!dados.success) return { ok: false, erros: errosDoZod(dados.error) };

  const jaVendido = await prisma.venda.findUnique({
    where: { veiculoId: dados.data.veiculoId },
    select: { id: true },
  });
  if (jaVendido) {
    return { ok: false, mensagem: "Este veículo já tem uma venda registrada." };
  }

  await prisma.$transaction([
    prisma.venda.create({
      data: {
        veiculoId: dados.data.veiculoId,
        valorCentavos: dados.data.valor,
        comissaoCentavos: dados.data.comissao,
        vendidoEm: dados.data.vendidoEm
          ? new Date(dados.data.vendidoEm)
          : new Date(),
        compradorNome: dados.data.compradorNome,
        compradorTelefone: dados.data.compradorTelefone,
        formaPagamento: dados.data.formaPagamento,
        observacoes: dados.data.observacoes,
        leadId: dados.data.leadId || null,
        vendedorId: dados.data.vendedorId || sessao.id,
      },
    }),
    prisma.veiculo.update({
      where: { id: dados.data.veiculoId },
      data: { status: "VENDIDO", destaque: false },
    }),
    // o lead que virou venda deixa de ser um atendimento em aberto
    ...(dados.data.leadId
      ? [
          prisma.lead.update({
            where: { id: dados.data.leadId },
            data: { status: "CONVERTIDO" },
          }),
        ]
      : []),
  ]);

  atualizar(dados.data.veiculoId);
  revalidatePath("/admin/leads");
  return { ok: true, mensagem: "Venda registrada." };
}

/**
 * Desfaz uma venda: apaga o registro e devolve o veículo ao estoque.
 * Serve para corrigir lançamento errado — e para negócio que caiu.
 */
export async function cancelarVenda(formData: FormData) {
  await exigirPermissao("verFinanceiro");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const venda = await prisma.venda.findUnique({
    where: { id },
    select: { veiculoId: true },
  });
  if (!venda) return;

  await prisma.$transaction([
    prisma.venda.delete({ where: { id } }),
    prisma.veiculo.update({
      where: { id: venda.veiculoId },
      data: { status: "DISPONIVEL" },
    }),
  ]);

  atualizar(venda.veiculoId);
}

/* ------------------------------------------------------- custo de aquisição */

export async function salvarCustoAquisicao(formData: FormData) {
  await exigirPermissao("verFinanceiro");

  const veiculoId = String(formData.get("veiculoId") ?? "");
  const bruto = String(formData.get("custo") ?? "").trim();
  if (!veiculoId) return;

  // campo vazio limpa o custo, em vez de gravar zero — zero seria uma
  // afirmação falsa ("não custou nada"), vazio é "ainda não informado"
  const centavos = bruto === "" ? null : paraCentavos(bruto);
  if (bruto !== "" && (centavos === null || centavos < 0)) return;

  await prisma.veiculo
    .update({
      where: { id: veiculoId },
      data: { custoAquisicaoCentavos: centavos },
    })
    .catch(() => null);

  atualizar(veiculoId);
}
