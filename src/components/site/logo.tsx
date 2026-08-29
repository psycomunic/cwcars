import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Logotipo do site. Enquanto não houver arquivo de logo em Configurações,
 * usa uma marca tipográfica com o traço da identidade.
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
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label={`${nome} — página inicial`}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={nome} className="h-10 w-auto object-contain" />
      ) : (
        <>
          <svg
            width="38"
            height="26"
            viewBox="0 0 38 26"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <path
              d="M2 20C6 8 14 2 26 2c5 0 9 2 10 5-8-2-16 0-22 5-4 3-8 7-12 8Z"
              fill="var(--brand)"
            />
            <path
              d="M8 24c4-9 12-14 22-14 3 0 5 .4 7 1-7 1-13 4-18 8-4 3-7 5-11 5Z"
              fill="var(--brand)"
              opacity="0.5"
            />
          </svg>
          <span className="leading-none">
            <span
              className={cn(
                "block font-display text-[19px] font-extrabold tracking-[0.02em]",
                invertido ? "text-white" : "text-ink",
              )}
            >
              {nome.toUpperCase()}
            </span>
            <span
              className={cn(
                "mt-0.5 block text-[9px] font-semibold tracking-[0.42em]",
                invertido ? "text-white/55" : "text-text-muted",
              )}
            >
              AUTO GROUP
            </span>
          </span>
        </>
      )}
    </Link>
  );
}
