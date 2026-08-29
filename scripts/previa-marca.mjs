/**
 * Rasteriza um SVG em uma folha de contato: tamanhos reais de uso, sobre
 * fundo claro e escuro. Serve para conferir a marca antes de colocar no site.
 * Uso: node previa-marca.tmp.mjs <arquivo.svg> <saida.png>
 */
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";

const [, , entrada, saida] = process.argv;
const svg = await readFile(entrada, "utf8");

const CLARO = "#ffffff";
const ESCURO = "#0f1115";

// alturas em que a marca realmente aparece: favicon, cabeçalho, hero
const ALTURAS = [24, 40, 72, 160];
const MARGEM = 24;

async function faixa(corFundo, corMarca) {
  const pecas = [];
  let x = MARGEM;
  let alturaMax = 0;

  for (const altura of ALTURAS) {
    const colorido = svg.replace(/currentColor/g, corMarca);
    const buffer = await sharp(Buffer.from(colorido), { density: 600 })
      .resize({ height: altura })
      .png()
      .toBuffer();
    const { width } = await sharp(buffer).metadata();
    pecas.push({ input: buffer, left: x, top: MARGEM });
    x += width + MARGEM * 2;
    alturaMax = Math.max(alturaMax, altura);
  }

  return sharp({
    create: {
      width: x,
      height: alturaMax + MARGEM * 2,
      channels: 4,
      background: corFundo,
    },
  })
    .composite(pecas)
    .png()
    .toBuffer();
}

const claro = await faixa(CLARO, "#0f1115");
const escuro = await faixa(ESCURO, "#ffffff");

const a = await sharp(claro).metadata();
const b = await sharp(escuro).metadata();

const folha = await sharp({
  create: {
    width: Math.max(a.width, b.width),
    height: a.height + b.height,
    channels: 4,
    background: "#ffffff",
  },
})
  .composite([
    { input: claro, left: 0, top: 0 },
    { input: escuro, left: 0, top: a.height },
  ])
  .png()
  .toBuffer();

await writeFile(saida, folha);
console.log(`prévia gerada: ${saida}`);
