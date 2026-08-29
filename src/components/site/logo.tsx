import Link from "next/link";
import { cn } from "@/lib/utils";
import { SimboloCW } from "@/components/site/marca-cw";

/**
 * Logotipo do site. Enquanto não houver arquivo de logo em Configurações,
 * usa a marca vetorial de `marca-cw.tsx`: o cupê de perfil ao lado do nome.
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
          <SimboloCW
            className={cn(
              "h-5 w-auto shrink-0",
              invertido ? "text-white" : "text-brand",
            )}
          />
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
