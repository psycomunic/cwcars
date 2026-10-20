"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { exigirPermissao } from "@/lib/auth";
import { errosDoZod } from "@/lib/validacao";
import { slugify } from "@/lib/utils";
import type { EstadoFormulario as EstadoSimples } from "@/lib/estados-formulario";

/* -------------------------------------------------------------------- leads */

const STATUS_PERMITIDOS = [
  "NOVO",
  "EM_ATENDIMENTO",
  "NEGOCIANDO",
  "CONVERTIDO",
  "PERDIDO",
] as const;

export async function atualizarLead(formData: FormData) {
  await exigirPermissao("gerenciarLeads");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const observacoes = formData.get("observacoes");

  if (!id) return;

  const dados: { status?: (typeof STATUS_PERMITIDOS)[number]; observacoes?: string } = {};
  if (STATUS_PERMITIDOS.includes(status as (typeof STATUS_PERMITIDOS)[number])) {
    dados.status = status as (typeof STATUS_PERMITIDOS)[number];
  }
  if (typeof observacoes === "string") {
    dados.observacoes = observacoes.slice(0, 2000);
  }

  if (Object.keys(dados).length === 0) return;

  await prisma.lead.update({ where: { id }, data: dados }).catch(() => null);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function excluirLead(formData: FormData) {
  await exigirPermissao("gerenciarLeads");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.lead.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

/* ------------------------------------------------------------------- marcas */

const esquemaMarca = z.object({
  nome: z.string().trim().min(2, "Informe o nome da marca").max(60),
  destaque: z
    .union([z.literal("on"), z.literal("")])
    .optional()
    .transform((v) => v === "on"),
});

export async function criarMarca(
  _anterior: EstadoSimples,
  formData: FormData,
): Promise<EstadoSimples> {
  await exigirPermissao("gerenciarCatalogo");

  const analise = esquemaMarca.safeParse(Object.fromEntries(formData.entries()));
  if (!analise.success) return { ok: false, erros: errosDoZod(analise.error) };

  const { nome, destaque } = analise.data;
  const slug = slugify(nome);

  const existente = await prisma.marca.findUnique({ where: { slug } });
  if (existente) {
    return { ok: false, erros: { nome: "Já existe uma marca com esse nome." } };
  }

  const total = await prisma.marca.count();
  await prisma.marca.create({ data: { nome, slug, destaque, ordem: total } });

  revalidatePath("/admin/marcas");
  revalidatePath("/");
  return { ok: true, mensagem: `Marca "${nome}" criada.` };
}

export async function alternarDestaqueMarca(formData: FormData) {
  await exigirPermissao("gerenciarCatalogo");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const marca = await prisma.marca.findUnique({
    where: { id },
    select: { destaque: true },
  });
  if (!marca) return;

  await prisma.marca.update({ where: { id }, data: { destaque: !marca.destaque } });
  revalidatePath("/admin/marcas");
  revalidatePath("/");
}

export async function excluirMarca(formData: FormData) {
  await exigirPermissao("gerenciarCatalogo");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const emUso = await prisma.veiculo.count({ where: { marcaId: id } });
  if (emUso > 0) return; // marcas com veículos não podem ser removidas

  await prisma.marca.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/marcas");
  revalidatePath("/");
}

/** Define (ou remove, enviando vazio) o arquivo de logo de uma marca. */
export async function salvarLogoMarca(formData: FormData) {
  await exigirPermissao("gerenciarCatalogo");

  const id = String(formData.get("id") ?? "");
  const logoUrl = String(formData.get("logoUrl") ?? "").trim();
  if (!id) return;

  await prisma.marca
    .update({ where: { id }, data: { logoUrl: logoUrl || null } })
    .catch(() => null);

  revalidatePath("/admin/marcas");
  revalidatePath("/");
}

const esquemaModelo = z.object({
  marcaId: z.string().trim().min(1, "Escolha a marca"),
  nome: z.string().trim().min(1, "Informe o nome do modelo").max(80),
});

export async function criarModelo(
  _anterior: EstadoSimples,
  formData: FormData,
): Promise<EstadoSimples> {
  await exigirPermissao("gerenciarCatalogo");

  const analise = esquemaModelo.safeParse(Object.fromEntries(formData.entries()));
  if (!analise.success) return { ok: false, erros: errosDoZod(analise.error) };

  const { marcaId, nome } = analise.data;

  await prisma.modelo.upsert({
    where: { marcaId_slug: { marcaId, slug: slugify(nome) } },
    update: { nome },
    create: { marcaId, nome, slug: slugify(nome) },
  });

  revalidatePath("/admin/marcas");
  return { ok: true, mensagem: `Modelo "${nome}" salvo.` };
}

export async function excluirModelo(formData: FormData) {
  await exigirPermissao("gerenciarCatalogo");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const emUso = await prisma.veiculo.count({ where: { modeloId: id } });
  if (emUso > 0) return;

  await prisma.modelo.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/marcas");
}

/* ------------------------------------------------------------ configurações */

const esquemaConfiguracao = z.object({
  nomeLoja: z.string().trim().min(2, "Informe o nome da loja").max(80),
  slogan: z.string().trim().max(160).optional().default(""),
  logoUrl: z.string().trim().max(400).optional().default(""),
  corPrimaria: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use um código hexadecimal, ex.: #E01F26"),
  telefone: z.string().trim().max(30).optional().default(""),
  whatsapp: z.string().trim().max(30).optional().default(""),
  email: z.string().trim().max(120).optional().default(""),
  endereco: z.string().trim().max(160).optional().default(""),
  cidade: z.string().trim().max(80).optional().default(""),
  estado: z.string().trim().max(2).optional().default(""),
  cep: z.string().trim().max(12).optional().default(""),
  mapaUrl: z.string().trim().max(600).optional().default(""),
  horarioVendas: z.string().trim().max(80).optional().default(""),
  horarioServico: z.string().trim().max(80).optional().default(""),
  instagram: z.string().trim().max(200).optional().default(""),
  facebook: z.string().trim().max(200).optional().default(""),
  youtube: z.string().trim().max(200).optional().default(""),
  tiktok: z.string().trim().max(200).optional().default(""),
});

export async function salvarConfiguracao(
  _anterior: EstadoSimples,
  formData: FormData,
): Promise<EstadoSimples> {
  await exigirPermissao("alterarConfiguracoes");

  const analise = esquemaConfiguracao.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!analise.success) return { ok: false, erros: errosDoZod(analise.error) };

  const d = analise.data;
  const dados = {
    ...d,
    estado: d.estado.toUpperCase(),
    logoUrl: d.logoUrl || null,
  };

  await prisma.configuracao.upsert({
    where: { id: "singleton" },
    update: dados,
    create: { id: "singleton", ...dados },
  });

  revalidatePath("/", "layout");
  return { ok: true, mensagem: "Configurações salvas." };
}

/* ------------------------------------------------- atendentes do WhatsApp */

const esquemaAtendente = z.object({
  nome: z.string().trim().min(2, "Informe o nome").max(60),
  telefone: z
    .string()
    .trim()
    .min(10, "Informe o número com DDD")
    .max(30)
    .refine((t) => t.replace(/\D/g, "").length >= 10, "Número incompleto"),
});

export async function criarAtendente(
  _anterior: EstadoSimples,
  formData: FormData,
): Promise<EstadoSimples> {
  await exigirPermissao("alterarConfiguracoes");

  const dados = esquemaAtendente.safeParse({
    nome: formData.get("nome"),
    telefone: formData.get("telefone"),
  });
  if (!dados.success) return { ok: false, erros: errosDoZod(dados.error) };

  const digitos = dados.data.telefone.replace(/\D/g, "");
  const existentes = await prisma.atendenteWhatsapp.findMany({
    select: { telefone: true, ordem: true },
  });
  if (existentes.some((a) => a.telefone.replace(/\D/g, "") === digitos)) {
    return { ok: false, erros: { telefone: "Este número já está na fila" } };
  }

  await prisma.atendenteWhatsapp.create({
    data: {
      nome: dados.data.nome,
      telefone: dados.data.telefone,
      ordem: existentes.length,
      // entra com a menor contagem da fila, senão nunca seria chamado
      atendimentos: existentes.length
        ? await menorContagem()
        : 0,
    },
  });

  revalidatePath("/admin/configuracoes");
  return { ok: true, mensagem: "Número adicionado ao rodízio." };
}

/** A menor contagem da fila, para quem entra depois não ficar para trás. */
async function menorContagem() {
  const menor = await prisma.atendenteWhatsapp.findFirst({
    where: { ativo: true },
    orderBy: { atendimentos: "asc" },
    select: { atendimentos: true },
  });
  return menor?.atendimentos ?? 0;
}

export async function alternarAtendente(formData: FormData) {
  await exigirPermissao("alterarConfiguracoes");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const atual = await prisma.atendenteWhatsapp.findUnique({
    where: { id },
    select: { ativo: true },
  });
  if (!atual) return;

  await prisma.atendenteWhatsapp.update({
    where: { id },
    // ao voltar, entra com a menor contagem: ficaria para trás de outra forma
    data: atual.ativo
      ? { ativo: false }
      : { ativo: true, atendimentos: await menorContagem() },
  });

  revalidatePath("/admin/configuracoes");
}

export async function excluirAtendente(formData: FormData) {
  await exigirPermissao("alterarConfiguracoes");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.atendenteWhatsapp.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/configuracoes");
}

/** Zera o placar do rodízio, para recomeçar empatado. */
export async function zerarRodizio() {
  await exigirPermissao("alterarConfiguracoes");
  await prisma.atendenteWhatsapp.updateMany({ data: { atendimentos: 0 } });
  revalidatePath("/admin/configuracoes");
}
