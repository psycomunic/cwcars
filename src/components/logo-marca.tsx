import { logoDaMarca } from "@/lib/logos-marcas";
import { cn } from "@/lib/utils";

/**
 * Logotipo de uma montadora, na cor oficial da marca.
 *
 * Ordem de preferência:
 *  1. arquivo enviado no painel (`logoUrl`) — cobre marcas sem traçado pronto
 *  2. traçado oficial de `src/lib/logos-marcas.ts`
 *  3. o nome da marca por extenso
 *
 * `className` controla a altura (ex.: "h-14"); a largura acompanha sozinha.
 */
export function LogoMarca({
  nome,
  slug,
  logoUrl,
  className = "h-10",
}: {
  nome: string;
  slug: string;
  logoUrl?: string | null;
  className?: string;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={nome}
        className={cn(
          "w-auto max-w-[150px] object-contain transition-transform duration-300 group-hover:scale-105",
          className,
        )}
      />
    );
  }

  const logo = logoDaMarca(slug);

  if (!logo) {
    return (
      <span
        className={cn(
          "flex items-center font-display text-2xl font-extrabold tracking-tight text-text transition-transform duration-300 group-hover:scale-105",
          className,
        )}
      >
        {nome}
      </span>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label={nome}
      fill={logo.cor}
      className={cn(
        "w-auto transition-transform duration-300 group-hover:scale-110",
        className,
      )}
    >
      <path d={logo.caminho} />
    </svg>
  );
}
