import Image from "next/image";
import { cn } from "@/lib/utils";

const PLACEHOLDER = "/placeholders/carro-01.svg";

/** Host do Supabase Storage, liberado no next.config.ts para otimização. */
const HOST_SUPABASE = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
})();

/** Só passam pelo next/image as fontes que o next.config.ts autoriza. */
function podeOtimizar(src: string) {
  if (src.startsWith("/")) return !src.endsWith(".svg");
  if (!HOST_SUPABASE) return false;
  try {
    return new URL(src).hostname === HOST_SUPABASE;
  } catch {
    return false;
  }
}

/**
 * Renderiza a foto de um veículo.
 * - arquivos locais otimizáveis (/uploads/...) passam pelo next/image
 * - SVG (placeholders) e URLs externas usam <img>, evitando configuração extra
 */
export function FotoVeiculo({
  url,
  alt,
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 33vw",
  ajuste = "cover",
}: {
  url?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  /** "cover" preenche o quadro (pode cortar); "contain" mostra a foto inteira */
  ajuste?: "cover" | "contain";
}) {
  const src = url && url.trim() !== "" ? url : PLACEHOLDER;
  const otimizavel = podeOtimizar(src);
  const encaixe = ajuste === "contain" ? "object-contain" : "object-cover";

  if (otimizavel) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(encaixe, className)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      className={cn("absolute inset-0 h-full w-full", encaixe, className)}
    />
  );
}
