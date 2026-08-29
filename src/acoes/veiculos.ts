"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sessaoAtual } from "@/lib/auth";
import { errosDoZod } from "@/lib/validacao";
import { paraCentavos } from "@/lib/format";
import { slugify } from "@/lib/utils";
import type { EstadoFormulario as EstadoVeiculo } from "@/lib/estados-formulario";

const booleano = z
  .union([z.literal("on"), z.literal("true"), z.literal("false"), z.literal("")])
  .optional()
  .transform((v) => v === "on" || v === "true");

const inteiro = (mensagem: string) =>
  z.coerce.number({ message: mensagem }).int().min(0, mensagem);

const esquemaImagem = z.object({
  url: z.string().min(1),
  alt: z.string().default(""),
});

const esquemaVeiculo = z.object({
  id: z.string().trim().optional(),
  marcaId: z.string().trim().min(1, "Escolha a marca"),
  modeloId: z.string().trim().optional(),
  modeloNovo: z.string().trim().optional(),
  versao: z.string().trim().min(2, "Informe a versão do veículo").max(160),

  anoFabricacao: inteiro("Ano de fabricação inválido").min(1950).max(2100),
  anoModelo: inteiro("Ano do modelo inválido").min(1950).max(2100),

  preco: z.string().trim().min(1, "Informe o preço"),
  precoDe: z.string().trim().optional(),
  precoFipe: z.string().trim().optional(),
  precoMedio: z.string().trim().optional(),

  quilometragem: inteiro("Quilometragem inválida"),
  cambio: z.enum(["MANUAL", "AUTOMATICO", "AUTOMATIZADO", "CVT"]),
  combustivel: z.enum([
    "FLEX",
    "GASOLINA",
    "ETANOL",
    "DIESEL",
    "GNV",
    "HIBRIDO",
    "ELETRICO",
  ]),
  carroceria: z.enum([
    "HATCH",
    "SEDA",
    "SUV",
    "PICAPE",
    "COUPE",
    "CONVERSIVEL",
    "MINIVAN",
    "PERUA",
    "UTILITARIO",
  ]),
  condicao: z.enum(["NOVO", "SEMINOVO", "USADO"]),
  status: z.enum(["RASCUNHO", "DISPONIVEL", "RESERVADO", "VENDIDO"]),

  cor: z.string().trim().min(2, "Informe a cor").max(40),
  portas: inteiro("Número de portas inválido").min(1).max(6),
  finalPlaca: z.string().trim().max(1).optional(),
  placa: z.string().trim().max(10).optional(),
  renavam: z.string().trim().max(20).optional(),

  blindado: booleano,
  aceitaTroca: booleano,
  unicoDono: booleano,
  ipvaPago: booleano,
  licenciado: booleano,
  garantiaFabrica: booleano,
  revisoesEmDia: booleano,
  destaque: booleano,

  descricao: z.string().trim().max(4000).optional(),
  videoUrl: z.string().trim().max(400).optional(),
  tour360Url: z.string().trim().max(400).optional(),
  cidade: z.string().trim().max(80).optional(),
  estado: z.string().trim().max(2).optional(),
  ordem: z.coerce.number().int().min(0).default(0),

  imagens: z.string().optional(),
  opcionais: z.string().optional(),
});

async function exigirSessao() {
  const sessao = await sessaoAtual();
  if (!sessao) redirect("/admin/login");
  return sessao;
}

/** Gera um slug único a partir dos dados do veículo. */
async function gerarSlug(base: string, idAtual?: string) {
  const raiz = slugify(base) || "veiculo";
  let candidato = raiz;
  let n = 1;

  for (;;) {
    const existente = await prisma.veiculo.findUnique({
      where: { slug: candidato },
      select: { id: true },
    });
    if (!existente || existente.id === idAtual) return candidato;
    n += 1;
    candidato = `${raiz}-${n}`;
  }
}

function listaJson<T>(bruto: string | undefined, esquema: z.ZodType<T>): T[] {
  if (!bruto) return [];
  try {
    const dados = JSON.parse(bruto);
    if (!Array.isArray(dados)) return [];
    return dados
      .map((item) => esquema.safeParse(item))
      .filter((r) => r.success)
      .map((r) => r.data);
  } catch {
    return [];
  }
}

export async function salvarVeiculo(
  _anterior: EstadoVeiculo,
  formData: FormData,
): Promise<EstadoVeiculo> {
  await exigirSessao();

  const analise = esquemaVeiculo.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!analise.success) {
    return { ok: false, erros: errosDoZod(analise.error) };
  }

  const d = analise.data;

  const precoCentavos = paraCentavos(d.preco);
  if (!precoCentavos || precoCentavos <= 0) {
    return { ok: false, erros: { preco: "Informe um preço válido" } };
  }

  // marca e modelo
  const marca = await prisma.marca.findUnique({ where: { id: d.marcaId } });
  if (!marca) return { ok: false, erros: { marcaId: "Marca não encontrada" } };

  let modeloId = d.modeloId;
  if (d.modeloNovo && d.modeloNovo.trim() !== "") {
    const nome = d.modeloNovo.trim();
    const modelo = await prisma.modelo.upsert({
      where: { marcaId_slug: { marcaId: marca.id, slug: slugify(nome) } },
      update: {},
      create: { marcaId: marca.id, nome, slug: slugify(nome) },
    });
    modeloId = modelo.id;
  }

  if (!modeloId) {
    return {
      ok: false,
      erros: { modeloId: "Escolha um modelo ou informe um novo" },
    };
  }

  const modelo = await prisma.modelo.findFirst({
    where: { id: modeloId, marcaId: marca.id },
  });
  if (!modelo) {
    return { ok: false, erros: { modeloId: "Modelo não pertence a esta marca" } };
  }

  const imagens = listaJson(d.imagens, esquemaImagem);
  const opcionais = listaJson(d.opcionais, z.string());

  const slug = await gerarSlug(
    `${marca.nome} ${modelo.nome} ${d.anoModelo} ${d.cor}`,
    d.id,
  );

  const dadosComuns = {
    marcaId: marca.id,
    modeloId: modelo.id,
    versao: d.versao,
    anoFabricacao: d.anoFabricacao,
    anoModelo: d.anoModelo,
    precoCentavos,
    precoDeCentavos: paraCentavos(d.precoDe),
    precoFipeCentavos: paraCentavos(d.precoFipe),
    precoMedioCentavos: paraCentavos(d.precoMedio),
    quilometragem: d.quilometragem,
    cambio: d.cambio,
    combustivel: d.combustivel,
    carroceria: d.carroceria,
    condicao: d.condicao,
    status: d.status,
    cor: d.cor,
    portas: d.portas,
    finalPlaca: d.finalPlaca || null,
    placa: d.placa || null,
    renavam: d.renavam || null,
    blindado: d.blindado,
    aceitaTroca: d.aceitaTroca,
    unicoDono: d.unicoDono,
    ipvaPago: d.ipvaPago,
    licenciado: d.licenciado,
    garantiaFabrica: d.garantiaFabrica,
    revisoesEmDia: d.revisoesEmDia,
    destaque: d.destaque,
    descricao: d.descricao ?? "",
    videoUrl: d.videoUrl || null,
    tour360Url: d.tour360Url || null,
    cidade: d.cidade ?? "",
    estado: (d.estado ?? "").toUpperCase(),
    ordem: d.ordem,
  };

  try {
    if (d.id) {
      await prisma.$transaction([
        prisma.veiculoImagem.deleteMany({ where: { veiculoId: d.id } }),
        prisma.veiculoOpcional.deleteMany({ where: { veiculoId: d.id } }),
        prisma.veiculo.update({
          where: { id: d.id },
          data: {
            ...dadosComuns,
            slug,
            publicadoEm:
              d.status === "DISPONIVEL" ? new Date() : undefined,
            imagens: {
              create: imagens.map((img, i) => ({
                url: img.url,
                alt: img.alt || `${marca.nome} ${modelo.nome} — foto ${i + 1}`,
                ordem: i,
                capa: i === 0,
              })),
            },
            opcionais: {
              create: opcionais.map((opcionalId) => ({ opcionalId })),
            },
          },
        }),
      ]);
    } else {
      await prisma.veiculo.create({
        data: {
          ...dadosComuns,
          slug,
          publicadoEm: d.status === "DISPONIVEL" ? new Date() : null,
          imagens: {
            create: imagens.map((img, i) => ({
              url: img.url,
              alt: img.alt || `${marca.nome} ${modelo.nome} — foto ${i + 1}`,
              ordem: i,
              capa: i === 0,
            })),
          },
          opcionais: {
            create: opcionais.map((opcionalId) => ({ opcionalId })),
          },
        },
      });
    }
  } catch (erro) {
    console.error("Falha ao salvar veículo", erro);
    return {
      ok: false,
      mensagem: "Não foi possível salvar. Verifique os dados e tente novamente.",
    };
  }

  revalidatePath("/admin/veiculos");
  revalidatePath("/estoque");
  revalidatePath("/");
  redirect("/admin/veiculos?salvo=1");
}

export async function excluirVeiculo(formData: FormData) {
  await exigirSessao();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.veiculo.delete({ where: { id } }).catch(() => null);

  revalidatePath("/admin/veiculos");
  revalidatePath("/estoque");
  revalidatePath("/");
}

export async function alternarDestaque(formData: FormData) {
  await exigirSessao();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const veiculo = await prisma.veiculo.findUnique({
    where: { id },
    select: { destaque: true },
  });
  if (!veiculo) return;

  await prisma.veiculo.update({
    where: { id },
    data: { destaque: !veiculo.destaque },
  });

  revalidatePath("/admin/veiculos");
  revalidatePath("/");
}

export async function mudarStatusVeiculo(formData: FormData) {
  await exigirSessao();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  const permitidos = ["RASCUNHO", "DISPONIVEL", "RESERVADO", "VENDIDO"] as const;
  if (!id || !permitidos.includes(status as (typeof permitidos)[number])) return;

  await prisma.veiculo.update({
    where: { id },
    data: {
      status: status as (typeof permitidos)[number],
      publicadoEm: status === "DISPONIVEL" ? new Date() : undefined,
    },
  });

  revalidatePath("/admin/veiculos");
  revalidatePath("/estoque");
  revalidatePath("/");
}
