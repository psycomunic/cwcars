/**
 * Marca CW Motors, redesenhada em vetor a partir do logotipo 3D original.
 *
 * A composição é a mesma do original: o contorno do cupê de perfil com o
 * monograma CW por cima, e o letreiro embaixo (esse fica no `Logo`, em texto
 * de verdade — mais nítido e selecionável que letra desenhada).
 *
 * Duas pinturas, porque cromado só existe sobre fundo escuro:
 * - padrão: `currentColor`, herda a cor de onde for colocada;
 * - `cromado`: o degradê metálico do original, para fundo escuro. Sobre branco
 *   ele praticamente desaparece — não use no cabeçalho claro.
 *
 * Três peças, cada uma para um tamanho de uso:
 * - `MarcaCW`     contorno + CW — cabeçalho, rodapé, redes sociais
 * - `SimboloCW`   silhueta sólida — listas e tamanhos pequenos
 * - `MonogramaCW` só as letras — favicon, avatar, quadrados
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

/**
 * Ids fixos de propósito. O degradê é idêntico em toda instância, então
 * repetir a definição na página é inofensivo — e ids fixos evitam depender de
 * hook, que não roda em Server Component.
 */
const ID_CROMO = "cw-cromo";
const ID_CROMO_FINO = "cw-cromo-fino";

function DefsCromado() {
  return (
    <defs>
      {/* corte em 49%/51% imita a linha do horizonte refletida no metal */}
      <linearGradient id={ID_CROMO} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="34%" stopColor="#cbd5e1" />
        <stop offset="49%" stopColor="#5b6472" />
        <stop offset="51%" stopColor="#e8edf3" />
        <stop offset="76%" stopColor="#8b95a5" />
        <stop offset="100%" stopColor="#f4f7fa" />
      </linearGradient>
      {/* versão de menos contraste, para o traço fino do contorno */}
      <linearGradient id={ID_CROMO_FINO} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e8edf3" />
        <stop offset="50%" stopColor="#7a8494" />
        <stop offset="100%" stopColor="#dfe6ee" />
      </linearGradient>
    </defs>
  );
}

type Props = {
  className?: string;
  /** Degradê metálico do logotipo original. Só sobre fundo escuro. */
  cromado?: boolean;
  /** Preenche para leitores de tela; sem isso a peça é decorativa. */
  titulo?: string;
};

function acessibilidade(titulo?: string) {
  return titulo
    ? { role: "img" as const, "aria-label": titulo }
    : { "aria-hidden": true as const };
}

function Letras({ cromado }: { cromado?: boolean }) {
  const tinta = cromado ? `url(#${ID_CROMO})` : "currentColor";
  return (
    <>
      <path d={LETRA_C} stroke={tinta} strokeWidth="8.6" strokeLinecap="butt" />
      <path
        d={LETRA_W}
        stroke={tinta}
        strokeWidth="8.6"
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeMiterlimit="6"
      />
    </>
  );
}

export function MarcaCW({ className, cromado, titulo }: Props) {
  return (
    <svg
      viewBox="0 0 196 70"
      fill="none"
      className={className}
      {...acessibilidade(titulo)}
    >
      {cromado && <DefsCromado />}
      <g transform="translate(2 6) scale(1.33)">
        <path
          d={CARRO}
          stroke={cromado ? `url(#${ID_CROMO_FINO})` : "currentColor"}
          strokeWidth={cromado ? 2.4 : 2}
          strokeLinejoin="round"
          opacity={cromado ? 1 : 0.5}
        />
      </g>
      <g transform="translate(64.3 18) scale(0.88)">
        <Letras cromado={cromado} />
      </g>
    </svg>
  );
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

export function MonogramaCW({ className, cromado, titulo }: Props) {
  return (
    <svg
      viewBox="0 0 76 44"
      fill="none"
      className={className}
      {...acessibilidade(titulo)}
    >
      {cromado && <DefsCromado />}
      <Letras cromado={cromado} />
    </svg>
  );
}
