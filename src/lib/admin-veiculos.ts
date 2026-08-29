import "server-only";
import { prisma } from "@/lib/prisma";

/** Marcas, modelos e opcionais usados no formulário do painel. */
export async function carregarOpcoesVeiculo() {
  const [marcas, modelos, opcionais] = await Promise.all([
    prisma.marca.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
    prisma.modelo.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, marcaId: true },
    }),
    prisma.opcional.findMany({
      orderBy: [{ categoria: "asc" }, { nome: "asc" }],
      select: { id: true, nome: true, categoria: true },
    }),
  ]);

  return { marcas, modelos, opcionais };
}

/** Converte centavos no texto usado pelos campos do formulário. */
export function centavosParaCampo(centavos: number | null | undefined) {
  if (centavos == null) return "";
  return (centavos / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
