/**
 * Marca CW Motors, redesenhada em vetor a partir do logotipo 3D original.
 *
 * O original é uma renderização cromada sobre fundo escuro — cromado não
 * sobrevive à vetorização e some sobre fundo branco. O que se preserva é a
 * forma: o cupê de perfil, o monograma CW e a composição dos dois. Todas as
 * peças usam `currentColor`, então herdam a cor de onde forem colocadas e
 * funcionam em fundo claro e escuro sem versão separada.
 *
 * Três peças, cada uma para um tamanho de uso:
 * - `SimboloCW`   silhueta sólida — cabeçalho, listas, tamanhos pequenos
 * - `MonogramaCW` só as letras — favicon, avatar, quadrados
 * - `MarcaCW`     contorno do carro atrás do CW — herói, rodapé, redes sociais
 */

/** Perfil do cupê. Proporção 148x44 (~3,4:1). */
const CARRO =
  "M3 32 C3 27 7 24.5 13 23.5 C28 21.5 46 20.5 58 20 C66 13 76 8 88 8 " +
  "C98 8 105 9.5 111 12.5 C123 18.5 134 25 140 29.5 C142.5 31 143 32 143 34 " +
  "L143 38 L124 38 A11 11 0 0 0 102 38 L46 38 A11 11 0 0 0 24 38 L3 38 Z";

/** Letra C: arco aberto à direita, terminais retos. */
const LETRA_C = "M27 11.2 A12.4 12.4 0 1 0 27 28.8";

/** Letra W: quatro hastes, vértices em ponta. */
const LETRA_W = "M36.5 6.6 L44.4 33.4 L53.2 17 L62 33.4 L69.9 6.6";

type Props = {
  className?: string;
  titulo?: string;
};

function acessibilidade(titulo?: string) {
  return titulo
    ? { role: "img" as const, "aria-label": titulo }
    : { "aria-hidden": true as const };
}

export function SimboloCW({ className, titulo }: Props) {
  return (
    <svg
      viewBox="0 0 148 44"
      fill="none"
      className={className}
      {...acessibilidade(titulo)}
    >
      <path d={CARRO} fill="currentColor" />
    </svg>
  );
}

export function MonogramaCW({ className, titulo }: Props) {
  return (
    <svg
      viewBox="0 0 76 44"
      fill="none"
      className={className}
      {...acessibilidade(titulo)}
    >
      <path
        d={LETRA_C}
        stroke="currentColor"
        strokeWidth="8.6"
        strokeLinecap="butt"
      />
      <path
        d={LETRA_W}
        stroke="currentColor"
        strokeWidth="8.6"
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeMiterlimit="6"
      />
    </svg>
  );
}

export function MarcaCW({ className, titulo }: Props) {
  return (
    <svg
      viewBox="0 0 196 70"
      fill="none"
      className={className}
      {...acessibilidade(titulo)}
    >
      <g transform="translate(2 6) scale(1.33)">
        <path
          d={CARRO}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          opacity="0.5"
        />
      </g>
      <g transform="translate(64.3 18) scale(0.88)">
        <path
          d={LETRA_C}
          stroke="currentColor"
          strokeWidth="8.6"
          strokeLinecap="butt"
        />
        <path
          d={LETRA_W}
          stroke="currentColor"
          strokeWidth="8.6"
          strokeLinecap="butt"
          strokeLinejoin="miter"
          strokeMiterlimit="6"
        />
      </g>
    </svg>
  );
}
