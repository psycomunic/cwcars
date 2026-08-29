/** Utilidades para derivar a paleta a partir da cor principal escolhida no painel. */

function normalizar(hex: string) {
  const limpo = hex.replace("#", "").trim();
  if (/^[0-9a-fA-F]{3}$/.test(limpo)) {
    return limpo
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return /^[0-9a-fA-F]{6}$/.test(limpo) ? limpo : null;
}

function componentes(hex: string) {
  const n = normalizar(hex);
  if (!n) return null;
  return [
    parseInt(n.slice(0, 2), 16),
    parseInt(n.slice(2, 4), 16),
    parseInt(n.slice(4, 6), 16),
  ] as const;
}

/** Escurece a cor em `fator` (0 a 1). */
export function escurecer(hex: string, fator = 0.18) {
  const rgb = componentes(hex);
  if (!rgb) return hex;
  const escuro = rgb.map((c) => Math.max(0, Math.round(c * (1 - fator))));
  return `#${escuro.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/** Versão bem clara da cor, usada em fundos suaves. */
export function suavizar(hex: string, opacidade = 0.1) {
  const rgb = componentes(hex);
  if (!rgb) return hex;
  return `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]} / ${opacidade})`;
}

/** Preto ou branco, conforme o contraste com a cor de fundo. */
export function contraste(hex: string) {
  const rgb = componentes(hex);
  if (!rgb) return "#ffffff";
  const [r, g, b] = rgb.map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  const luminancia = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminancia > 0.45 ? "#14171d" : "#ffffff";
}

/** Bloco CSS que sobrescreve os tokens da marca. */
export function variaveisDaMarca(cor: string) {
  return `:root{--brand:${cor};--brand-hover:${escurecer(cor)};--brand-soft:${suavizar(cor, 0.1)};--brand-contrast:${contraste(cor)};}`;
}
