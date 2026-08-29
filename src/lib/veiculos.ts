import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { Ordenacao } from "@/lib/ordenacao";

export type { Ordenacao } from "@/lib/ordenacao";

export const VEICULO_CARD_SELECT = {
  id: true,
  slug: true,
  versao: true,
  anoFabricacao: true,
  anoModelo: true,
  precoCentavos: true,
  precoDeCentavos: true,
  quilometragem: true,
  cambio: true,
  combustivel: true,
  carroceria: true,
  condicao: true,
  cor: true,
  cidade: true,
  estado: true,
  status: true,
  blindado: true,
  destaque: true,
  marca: { select: { nome: true, slug: true } },
  modelo: { select: { nome: true, slug: true } },
  // o card tem carrossel próprio; algumas fotos bastam para folhear sem
  // pesar a listagem
  imagens: {
    orderBy: { ordem: "asc" },
    take: 6,
    select: { id: true, url: true, alt: true },
  },
} satisfies Prisma.VeiculoSelect;

export type VeiculoCard = Prisma.VeiculoGetPayload<{
  select: typeof VEICULO_CARD_SELECT;
}>;

const ORDENS: Record<Ordenacao, Prisma.VeiculoOrderByWithRelationInput[]> = {
  recentes: [{ publicadoEm: "desc" }, { criadoEm: "desc" }],
  "menor-preco": [{ precoCentavos: "asc" }],
  "maior-preco": [{ precoCentavos: "desc" }],
  "menor-km": [{ quilometragem: "asc" }],
  "ano-novo": [{ anoModelo: "desc" }],
};

export type FiltrosVeiculo = {
  q?: string;
  marca?: string;
  modelo?: string;
  carroceria?: string;
  cambio?: string;
  combustivel?: string;
  condicao?: string;
  cor?: string;
  precoMin?: number;
  precoMax?: number;
  anoMin?: number;
  anoMax?: number;
  kmMax?: number;
  ordenar?: Ordenacao;
  pagina?: number;
  porPagina?: number;
};

/** Converte os search params da URL em filtros tipados. */
export function lerFiltros(
  params: Record<string, string | string[] | undefined>,
): FiltrosVeiculo {
  const texto = (chave: string) => {
    const v = params[chave];
    const s = Array.isArray(v) ? v[0] : v;
    return s && s.trim() !== "" ? s.trim() : undefined;
  };
  const inteiro = (chave: string) => {
    const s = texto(chave);
    if (!s) return undefined;
    const n = Number(s.replace(/\D/g, ""));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };

  const ordenar = texto("ordenar") as Ordenacao | undefined;

  return {
    q: texto("q"),
    marca: texto("marca"),
    modelo: texto("modelo"),
    carroceria: texto("carroceria"),
    cambio: texto("cambio"),
    combustivel: texto("combustivel"),
    condicao: texto("condicao"),
    cor: texto("cor"),
    precoMin: inteiro("precoMin"),
    precoMax: inteiro("precoMax"),
    anoMin: inteiro("anoMin"),
    anoMax: inteiro("anoMax"),
    kmMax: inteiro("kmMax"),
    ordenar: ordenar && ordenar in ORDENS ? ordenar : "recentes",
    pagina: inteiro("pagina") ?? 1,
  };
}

function montarWhere(f: FiltrosVeiculo): Prisma.VeiculoWhereInput {
  const where: Prisma.VeiculoWhereInput = {
    status: "DISPONIVEL",
  };
  const e: Prisma.VeiculoWhereInput[] = [];

  if (f.marca) e.push({ marca: { slug: f.marca } });
  if (f.modelo) e.push({ modelo: { slug: f.modelo } });
  if (f.carroceria)
    e.push({ carroceria: f.carroceria as Prisma.EnumCarroceriaFilter["equals"] });
  if (f.cambio) e.push({ cambio: f.cambio as Prisma.EnumCambioFilter["equals"] });
  if (f.combustivel)
    e.push({
      combustivel: f.combustivel as Prisma.EnumCombustivelFilter["equals"],
    });
  if (f.condicao)
    e.push({ condicao: f.condicao as Prisma.EnumCondicaoFilter["equals"] });
  if (f.cor) e.push({ cor: { equals: f.cor, mode: "insensitive" } });

  if (f.precoMin || f.precoMax) {
    e.push({
      precoCentavos: {
        ...(f.precoMin ? { gte: f.precoMin * 100 } : {}),
        ...(f.precoMax ? { lte: f.precoMax * 100 } : {}),
      },
    });
  }
  if (f.anoMin || f.anoMax) {
    e.push({
      anoModelo: {
        ...(f.anoMin ? { gte: f.anoMin } : {}),
        ...(f.anoMax ? { lte: f.anoMax } : {}),
      },
    });
  }
  if (f.kmMax) e.push({ quilometragem: { lte: f.kmMax } });

  if (f.q) {
    const termo = f.q;
    e.push({
      OR: [
        { versao: { contains: termo, mode: "insensitive" } },
        { cor: { contains: termo, mode: "insensitive" } },
        { marca: { nome: { contains: termo, mode: "insensitive" } } },
        { modelo: { nome: { contains: termo, mode: "insensitive" } } },
      ],
    });
  }

  if (e.length) where.AND = e;
  return where;
}

export async function listarVeiculos(f: FiltrosVeiculo) {
  const porPagina = f.porPagina ?? 12;
  const pagina = Math.max(1, f.pagina ?? 1);
  const where = montarWhere(f);

  const [itens, total] = await Promise.all([
    prisma.veiculo.findMany({
      where,
      select: VEICULO_CARD_SELECT,
      orderBy: ORDENS[f.ordenar ?? "recentes"],
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    prisma.veiculo.count({ where }),
  ]);

  return {
    itens,
    total,
    pagina,
    porPagina,
    paginas: Math.max(1, Math.ceil(total / porPagina)),
  };
}

export async function veiculosDestaque(limite = 8) {
  return prisma.veiculo.findMany({
    where: { status: "DISPONIVEL", destaque: true },
    select: VEICULO_CARD_SELECT,
    orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
    take: limite,
  });
}

export async function veiculosRecentes(limite = 8) {
  return prisma.veiculo.findMany({
    where: { status: "DISPONIVEL" },
    select: VEICULO_CARD_SELECT,
    orderBy: [{ publicadoEm: "desc" }, { criadoEm: "desc" }],
    take: limite,
  });
}

export async function veiculoPorSlug(slug: string) {
  return prisma.veiculo.findFirst({
    where: { slug, status: { in: ["DISPONIVEL", "RESERVADO", "VENDIDO"] } },
    include: {
      marca: true,
      modelo: true,
      imagens: { orderBy: { ordem: "asc" } },
      opcionais: { include: { opcional: true } },
    },
  });
}

export type VeiculoDetalhe = NonNullable<
  Awaited<ReturnType<typeof veiculoPorSlug>>
>;

export async function veiculosSimilares(
  veiculo: { id: string; modeloId: string; carroceria: string; precoCentavos: number },
  limite = 8,
) {
  const margem = Math.round(veiculo.precoCentavos * 0.3);

  const mesmoModelo = await prisma.veiculo.findMany({
    where: {
      status: "DISPONIVEL",
      id: { not: veiculo.id },
      modeloId: veiculo.modeloId,
    },
    select: VEICULO_CARD_SELECT,
    take: limite,
  });

  if (mesmoModelo.length >= limite) return mesmoModelo;

  const complemento = await prisma.veiculo.findMany({
    where: {
      status: "DISPONIVEL",
      id: { not: veiculo.id },
      modeloId: { not: veiculo.modeloId },
      precoCentavos: {
        gte: veiculo.precoCentavos - margem,
        lte: veiculo.precoCentavos + margem,
      },
    },
    select: VEICULO_CARD_SELECT,
    take: limite - mesmoModelo.length,
  });

  return [...mesmoModelo, ...complemento];
}

export async function registrarVisita(id: string) {
  await prisma.veiculo
    .update({ where: { id }, data: { visitas: { increment: 1 } } })
    .catch(() => null);
}

/** Opções para montar os selects de filtro a partir do estoque real. */
export async function opcoesDeFiltro() {
  const [marcas, modelos, faixa, cores] = await Promise.all([
    prisma.marca.findMany({
      where: { veiculos: { some: { status: "DISPONIVEL" } } },
      orderBy: { nome: "asc" },
      select: {
        nome: true,
        slug: true,
        _count: { select: { veiculos: { where: { status: "DISPONIVEL" } } } },
      },
    }),
    prisma.modelo.findMany({
      where: { veiculos: { some: { status: "DISPONIVEL" } } },
      orderBy: { nome: "asc" },
      select: { nome: true, slug: true, marca: { select: { slug: true } } },
    }),
    prisma.veiculo.aggregate({
      where: { status: "DISPONIVEL" },
      _min: { precoCentavos: true, anoModelo: true },
      _max: { precoCentavos: true, anoModelo: true },
    }),
    prisma.veiculo.findMany({
      where: { status: "DISPONIVEL" },
      distinct: ["cor"],
      orderBy: { cor: "asc" },
      select: { cor: true },
    }),
  ]);

  return {
    marcas,
    modelos,
    cores: cores.map((c) => c.cor),
    precoMin: Math.floor((faixa._min.precoCentavos ?? 0) / 100),
    precoMax: Math.ceil((faixa._max.precoCentavos ?? 0) / 100),
    anoMin: faixa._min.anoModelo ?? 2000,
    anoMax: faixa._max.anoModelo ?? new Date().getFullYear(),
  };
}

export async function contagemPorCarroceria() {
  const linhas = await prisma.veiculo.groupBy({
    by: ["carroceria"],
    where: { status: "DISPONIVEL" },
    _count: { _all: true },
  });
  return Object.fromEntries(linhas.map((l) => [l.carroceria, l._count._all]));
}
