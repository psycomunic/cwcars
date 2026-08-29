/**
 * Gera src/lib/logos-marcas.ts a partir do pacote simple-icons.
 * Rode com `npm run logos` depois de acrescentar uma marca na lista abaixo.
 *
 * A chave é o slug da marca no nosso banco (slugify do nome).
 * Marcas sem ícone no simple-icons (Mercedes-Benz, Land Rover, BYD, Chery,
 * Haval, Lexus, Dodge…) ficam de fora de propósito: para elas o painel
 * permite enviar o arquivo do logo em Marcas e modelos.
 */
import { writeFileSync } from "node:fs";
import * as si from "simple-icons";

// nosso slug -> slug do simple-icons
const MARCAS = {
  audi: "audi",
  bmw: "bmw",
  chevrolet: "chevrolet",
  citroen: "citroen",
  fiat: "fiat",
  ford: "ford",
  honda: "honda",
  hyundai: "hyundai",
  iveco: "iveco",
  jeep: "jeep",
  kia: "kia",
  mini: "mini",
  mitsubishi: "mitsubishi",
  nissan: "nissan",
  peugeot: "peugeot",
  porsche: "porsche",
  ram: "ram",
  renault: "renault",
  scania: "scania",
  smart: "smart",
  subaru: "subaru",
  suzuki: "suzuki",
  tesla: "tesla",
  toyota: "toyota",
  volkswagen: "volkswagen",
  volvo: "volvo",
};

/**
 * Marcas que o simple-icons não distribui (a Mercedes-Benz pediu a remoção do
 * pacote). Traçado desenhado aqui, na mesma caixa 24x24 dos demais.
 * Para as outras que faltam (Land Rover, BYD, Chery, Haval, Lexus, Dodge…) o
 * painel permite enviar o arquivo do logo em Marcas e modelos.
 */
const MANUAIS = {
  "mercedes-benz": {
    titulo: "Mercedes-Benz",
    cor: "#000000",
    // anel + estrela de três pontas (hastes a 90°, 210° e 330°),
    // traçado calculado geometricamente na caixa 24x24
    caminho:
      "M12 0.7A11.3 11.3 0 1 1 12 23.3A11.3 11.3 0 1 1 12 0.7ZM12 2.25A9.75 9.75 0 1 0 12 21.75A9.75 9.75 0 1 0 12 2.25ZM12 2.65L13.15 12L10.85 12ZM3.903 16.675L11.425 11.004L12.575 12.996ZM20.097 16.675L11.425 12.996L12.575 11.004Z",
  },
};

const porSlug = new Map(
  Object.values(si)
    .filter((i) => i && i.slug)
    .map((i) => [i.slug, i]),
);

const linhas = [];
const faltando = [];

for (const [nosso, deles] of Object.entries(MARCAS)) {
  const icone = porSlug.get(deles);
  if (!icone) {
    faltando.push(nosso);
    continue;
  }
  linhas.push(
    `  "${nosso}": {\n    titulo: ${JSON.stringify(icone.title)},\n    cor: "#${icone.hex}",\n    caminho:\n      ${JSON.stringify(icone.path)},\n  },`,
  );
}

for (const [nosso, logo] of Object.entries(MANUAIS)) {
  linhas.push(
    `  "${nosso}": {
    titulo: ${JSON.stringify(logo.titulo)},
    cor: ${JSON.stringify(logo.cor)},
    caminho:
      ${JSON.stringify(logo.caminho)},
  },`,
  );
}

linhas.sort();

const conteudo = `/**
 * Logotipos oficiais das montadoras, em traçado único (viewBox 24x24).
 *
 * ARQUIVO GERADO — não edite à mão. Rode \`npm run logos\` depois de mexer
 * em scripts/gerar-logos-marcas.mjs.
 *
 * Origem: pacote simple-icons. As marcas pertencem a seus titulares; o uso
 * aqui é apenas para identificar os veículos que a loja comercializa.
 */

export type LogoMarca = {
  titulo: string;
  /** cor oficial da marca */
  cor: string;
  /** path SVG em viewBox 0 0 24 24 */
  caminho: string;
};

export const LOGOS_MARCAS: Record<string, LogoMarca> = {
${linhas.join("\n")}
};

/** Logo oficial da marca, ou null se ela não tiver traçado disponível. */
export function logoDaMarca(slug: string): LogoMarca | null {
  return LOGOS_MARCAS[slug] ?? null;
}
`;

writeFileSync("src/lib/logos-marcas.ts", conteudo);
console.log(`${linhas.length} logos gravados em src/lib/logos-marcas.ts`);
if (faltando.length) console.log("sem ícone:", faltando.join(", "));
