import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Logotipo do site.
 *
 * Usa o logotipo oficial vetorizado, gerado a partir do arquivo do CorelDRAW
 * em `marca-origem/` por `npm run marca:gerar`. São dois arquivos porque o
 * contorno do carro e a palavra MOTORS são escuros: sobre o rodapé preto eles
 * sumiriam, então ali entra a versão invertida.
 *
 * Se a loja enviar um logotipo próprio em Configurações, ele tem prioridade.
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
  const arquivo = invertido
    ? "/marca/logo-inverso.svg"
    : "/marca/logo.svg";

  return (
    <Link
      href="/"
      className={cn("inline-flex shrink-0 items-center", className)}
      aria-label={`${nome} — página inicial`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl || arquivo}
        alt={nome}
        className="h-12 w-auto object-contain"
      />
    </Link>
  );
}
