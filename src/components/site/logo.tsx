import Link from "next/link";
import { cn } from "@/lib/utils";
import { MarcaCW } from "@/components/site/marca-cw";

/**
 * Logotipo do site, na composição do logotipo original: o contorno do cupê com
 * o monograma CW por cima e o nome da loja embaixo, bem espaçado.
 *
 * O letreiro é texto de verdade, não caminho vetorial — fica nítido em
 * qualquer tela, acompanha a fonte da identidade e continua sendo o nome que a
 * loja configurou no painel.
 *
 * Sobre fundo escuro (`invertido`) entra o degradê metálico do original; sobre
 * o branco do cabeçalho ele sumiria, então ali a marca é sólida.
 */
export function Logo({
  nome,
  logoUrl,
  invertido = false,
  className,
}: {
  nome: string;
  logoUrl?: string | null;
  invertido?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={cn("inline-flex shrink-0 flex-col items-center", className)}
      aria-label={`${nome} — página inicial`}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={nome} className="h-12 w-auto object-contain" />
      ) : (
        <>
          <MarcaCW
            cromado={invertido}
            className={cn("h-9 w-auto", !invertido && "text-ink")}
          />
          <span
            className={cn(
              // o text-indent compensa o espaço que o tracking deixa depois da
              // última letra — sem ele o nome fica deslocado para a esquerda
              "mt-1.5 font-display text-[11px] font-extrabold tracking-[0.26em] [text-indent:0.26em]",
              invertido ? "text-white/90" : "text-ink",
            )}
          >
            {nome.toUpperCase()}
          </span>
        </>
      )}
    </Link>
  );
}
