/** Opções de ordenação do estoque. Módulo neutro: usado no servidor e no cliente. */

export type Ordenacao =
  | "recentes"
  | "menor-preco"
  | "maior-preco"
  | "menor-km"
  | "ano-novo";

export const ORDENACOES: Array<{ value: Ordenacao; label: string }> = [
  { value: "recentes", label: "Mais recentes" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "menor-km", label: "Menor quilometragem" },
  { value: "ano-novo", label: "Ano mais novo" },
];
