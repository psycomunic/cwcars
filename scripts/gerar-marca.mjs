/**
 * Converte o SVG exportado do CorelDRAW nos arquivos que o site usa.
 *
 * O que o arquivo original traz e precisa sair:
 * - um <image> apontando para um PNG externo, posicionado fora da área de arte
 *   (sobra do CorelDRAW). Fora que a referência é externa e com barra invertida,
 *   navegador nenhum carrega imagem externa dentro de SVG usado em <img>;
 * - um retângulo branco cobrindo a tela inteira, que apareceria como um bloco
 *   branco sobre o rodapé escuro;
 * - uma tela de 10000x10000 com a arte ocupando só o miolo.
 */
import { readFile, writeFile } from "node:fs/promises";

const ORIGEM = "marca-origem/LOGO CW CARS.svg";

/** Medidas apuradas rasterizando e aparando o transparente. */
const ARTE = { x: 1170, y: 3350, largura: 7660, altura: 3310 };
/** Só o carro e o CW, sem o letreiro (há um vão limpo entre os dois). */
const MARCA = { x: 1170, y: 3350, largura: 7660, altura: 2380 };
/** Só as letras. */
const LETRAS = { x: 2010, y: 4090, largura: 5810, altura: 1490 };

function base(svg) {
  return svg
    .replace(/<image[^>]*\/?>/g, "")
    .replace(/<rect class="fil0"[^>]*\/>/g, "")
    .replace(/ width="100mm" height="100mm"/, "")
    .replace(/<!DOCTYPE[^>]*>\n?/, "")
    .replace(/<\?xml[^>]*\?>\n?/, "");
}

function recortar(svg, { x, y, largura, altura }) {
  return svg.replace(
    /viewBox="0 0 10000 10000"/,
    `viewBox="${x} ${y} ${largura} ${altura}"`,
  );
}

/** Versão para fundo escuro: o que era escuro vira claro, e vice-versa. */
function inverter(svg) {
  return svg
    .replace(".fil2 {fill:#0F1115}", ".fil2 {fill:#FEFEFE}")
    .replace(".fil3 {fill:black}", ".fil3 {fill:#FEFEFE}")
    .replace(".fil4 {fill:#FEFEFE}", ".fil4 {fill:#0F1115}");
}

const original = base(await readFile(ORIGEM, "utf8"));

const saidas = [
  ["public/marca/logo.svg", recortar(original, ARTE)],
  ["public/marca/logo-inverso.svg", inverter(recortar(original, ARTE))],
  ["public/marca/simbolo.svg", recortar(original, MARCA)],
  ["public/marca/simbolo-inverso.svg", inverter(recortar(original, MARCA))],
  ["public/marca/letras.svg", recortar(original, LETRAS)],
  ["public/marca/letras-inverso.svg", inverter(recortar(original, LETRAS))],
];

/**
 * Favicon: só as letras, brancas sobre o vermelho da marca.
 * A logo inteira é 2,3:1 e as letras 3,9:1 — num quadrado de 16px qualquer
 * uma delas vira borrão. Branco sobre vermelho foi o par que sobreviveu ao
 * teste nos três tamanhos (16, 32 e 64), por contraste e pela cor da marca.
 */
const letrasBrancas = recortar(original, LETRAS).replace(
  ".fil1 {fill:#E01F26}",
  ".fil1 {fill:#FEFEFE}",
);
const proporcao = LETRAS.largura / LETRAS.altura;
const largura = 56;
const altura = largura / proporcao;
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#E01F26"/>
  <svg x="4" y="${((64 - altura) / 2).toFixed(2)}" width="${largura}" height="${altura.toFixed(2)}">${letrasBrancas}</svg>
</svg>
`;
saidas.push(["src/app/icon.svg", favicon]);

for (const [destino, conteudo] of saidas) {
  await writeFile(destino, conteudo);
  console.log(`${destino}  ${(conteudo.length / 1024).toFixed(1)} KB`);
}
