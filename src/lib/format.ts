/** Todos os valores monetários no banco são inteiros em CENTAVOS. */

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const BRL_CENTAVOS = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** 32488000 -> "R$ 324.880" */
export function moeda(centavos: number | null | undefined) {
  if (centavos == null) return "Sob consulta";
  return BRL.format(centavos / 100);
}

/** 32488050 -> "R$ 324.880,50" */
export function moedaExata(centavos: number | null | undefined) {
  if (centavos == null) return "Sob consulta";
  return BRL_CENTAVOS.format(centavos / 100);
}

/** "324.880,50" | "324880" | 324880 -> 32488050 */
export function paraCentavos(valor: string | number | null | undefined) {
  if (valor == null || valor === "") return null;
  if (typeof valor === "number") return Math.round(valor * 100);
  const limpo = valor.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(",", ".");
  const n = Number(limpo);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

/** 29988 -> "29.988 km" */
export function km(valor: number | null | undefined) {
  if (valor == null) return "—";
  return `${new Intl.NumberFormat("pt-BR").format(valor)} km`;
}

export function numero(valor: number | null | undefined) {
  if (valor == null) return "—";
  return new Intl.NumberFormat("pt-BR").format(valor);
}

/** (2024, 2025) -> "2024/2025" */
export function ano(fabricacao: number, modelo: number) {
  return `${fabricacao}/${modelo}`;
}

export function data(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(d));
}

export function dataHora(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(d),
  );
}

/** "(32) 98811-2233" -> "5532988112233" */
export function telefoneParaWhatsapp(telefone: string) {
  const digitos = telefone.replace(/\D/g, "");
  if (!digitos) return "";
  return digitos.startsWith("55") ? digitos : `55${digitos}`;
}

export function telefoneMascara(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Diferença percentual do anúncio contra a FIPE. Negativo = abaixo da FIPE. */
export function variacaoFipe(precoCentavos: number, fipeCentavos: number | null | undefined) {
  if (!fipeCentavos) return null;
  return ((precoCentavos - fipeCentavos) / fipeCentavos) * 100;
}
