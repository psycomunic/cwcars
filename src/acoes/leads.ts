"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  errosDoZod,
  esquemaFinanciamento,
  esquemaLead,
  esquemaTroca,
} from "@/lib/validacao";
import { paraCentavos } from "@/lib/format";
import type { EstadoFormulario } from "@/lib/estados-formulario";

const SUCESSO =
  "Mensagem enviada! Um consultor entrará em contato em breve.";

function dados(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

/** Contato geral e interesse em um veículo específico. */
export async function enviarLead(
  _anterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const analise = esquemaLead.safeParse(dados(formData));
  if (!analise.success) {
    return { ok: false, erros: errosDoZod(analise.error) };
  }

  const d = analise.data;

  try {
    await prisma.lead.create({
      data: {
        nome: d.nome,
        email: d.email,
        telefone: d.telefone,
        mensagem: d.mensagem,
        origem: d.origem,
        aceitaContato: d.aceitaContato,
        veiculoId: d.veiculoId || null,
      },
    });
  } catch {
    return {
      ok: false,
      mensagem: "Não foi possível enviar agora. Tente novamente em instantes.",
    };
  }

  revalidatePath("/admin/leads");
  return { ok: true, mensagem: SUCESSO };
}

/** Simulação de financiamento. */
export async function enviarFinanciamento(
  _anterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const analise = esquemaFinanciamento.safeParse(dados(formData));
  if (!analise.success) {
    return { ok: false, erros: errosDoZod(analise.error) };
  }

  const d = analise.data;

  try {
    await prisma.lead.create({
      data: {
        nome: d.nome,
        email: d.email,
        telefone: d.telefone,
        mensagem: d.mensagem,
        origem: "FINANCIAMENTO",
        aceitaContato: d.aceitaContato,
        veiculoId: d.veiculoId || null,
        cpf: d.cpf.replace(/\D/g, ""),
        dataNascimento: new Date(d.dataNascimento),
        entradaCentavos: paraCentavos(d.entrada),
        parcelas: d.parcelas,
      },
    });
  } catch {
    return {
      ok: false,
      mensagem: "Não foi possível enviar agora. Tente novamente em instantes.",
    };
  }

  revalidatePath("/admin/leads");
  return {
    ok: true,
    mensagem:
      "Simulação enviada! Nossa equipe vai retornar com as melhores condições.",
  };
}

/** Avaliação de troca do veículo usado. */
export async function enviarTroca(
  _anterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const analise = esquemaTroca.safeParse(dados(formData));
  if (!analise.success) {
    return { ok: false, erros: errosDoZod(analise.error) };
  }

  const d = analise.data;

  try {
    await prisma.lead.create({
      data: {
        nome: d.nome,
        email: d.email,
        telefone: d.telefone,
        mensagem: d.mensagem,
        origem: "AVALIACAO_TROCA",
        aceitaContato: d.aceitaContato,
        trocaPlaca: d.trocaPlaca.toUpperCase().replace(/[^A-Z0-9]/g, ""),
        trocaMarca: d.trocaMarca,
        trocaModelo: d.trocaModelo,
        trocaAno: d.trocaAno,
        trocaKm: d.trocaKm,
      },
    });
  } catch {
    return {
      ok: false,
      mensagem: "Não foi possível enviar agora. Tente novamente em instantes.",
    };
  }

  revalidatePath("/admin/leads");
  return {
    ok: true,
    mensagem:
      "Avaliação solicitada! Em breve enviaremos uma proposta para o seu veículo.",
  };
}
