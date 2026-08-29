"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { FotoVeiculo } from "@/components/foto-veiculo";
import { cn } from "@/lib/utils";

type Imagem = { id: string; url: string; alt: string };

export function GaleriaVeiculo({
  imagens,
  titulo,
}: {
  imagens: Imagem[];
  titulo: string;
}) {
  const [atual, setAtual] = useState(0);
  const [ampliado, setAmpliado] = useState(false);

  const total = imagens.length || 1;
  const lista: Imagem[] =
    imagens.length > 0
      ? imagens
      : [{ id: "vazio", url: "", alt: `${titulo} — sem foto` }];

  const anterior = useCallback(
    () => setAtual((i) => (i - 1 + total) % total),
    [total],
  );
  const proxima = useCallback(() => setAtual((i) => (i + 1) % total), [total]);

  useEffect(() => {
    if (!ampliado) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAmpliado(false);
      if (e.key === "ArrowLeft") anterior();
      if (e.key === "ArrowRight") proxima();
    };
    window.addEventListener("keydown", aoTeclar);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = "";
    };
  }, [ampliado, anterior, proxima]);

  const foto = lista[atual];

  return (
    <>
      <div className="overflow-hidden rounded-[var(--radius)] bg-surface-3">
        <div
          role="button"
          tabIndex={0}
          aria-label="Ampliar foto"
          onClick={() => setAmpliado(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setAmpliado(true);
            }
          }}
          className="relative aspect-[16/10] w-full cursor-zoom-in"
        >
          <FotoVeiculo
            url={foto.url}
            alt={foto.alt || titulo}
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
          />

          {lista.length > 1 && (
            <>
              <BotaoGaleria lado="esquerda" aoClicar={anterior} />
              <BotaoGaleria lado="direita" aoClicar={proxima} />
            </>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setAmpliado(true);
            }}
            className="absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition-colors hover:bg-ink"
          >
            <Expand size={13} />
            Ampliar
          </button>

          <span className="absolute bottom-3 left-3 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            {atual + 1} / {lista.length}
          </span>
        </div>
      </div>

      {lista.length > 1 && (
        <div className="scroll-x no-scrollbar mt-3 flex gap-2.5 pb-1">
          {lista.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => (i === atual ? setAmpliado(true) : setAtual(i))}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === atual}
              className={cn(
                "relative h-20 w-28 shrink-0 cursor-pointer overflow-hidden rounded-[var(--radius-sm)] bg-surface-3 transition-all",
                i === atual
                  ? "ring-2 ring-brand ring-offset-2 ring-offset-surface"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              <FotoVeiculo url={img.url} alt={img.alt} sizes="112px" />
            </button>
          ))}
        </div>
      )}

      {ampliado && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Fotos — ${titulo}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4"
          onClick={() => setAmpliado(false)}
        >
          <button
            type="button"
            onClick={() => setAmpliado(false)}
            aria-label="Fechar"
            className="absolute right-5 top-5 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={22} />
          </button>

          <div
            className="relative h-[88vh] w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <FotoVeiculo
              url={foto.url}
              alt={foto.alt || titulo}
              sizes="100vw"
              ajuste="contain"
            />
            {lista.length > 1 && (
              <>
                <BotaoGaleria lado="esquerda" aoClicar={anterior} />
                <BotaoGaleria lado="direita" aoClicar={proxima} />
                <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                  {atual + 1} / {lista.length}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function BotaoGaleria({
  lado,
  aoClicar,
}: {
  lado: "esquerda" | "direita";
  aoClicar: () => void;
}) {
  const Icone = lado === "esquerda" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        aoClicar();
      }}
      aria-label={lado === "esquerda" ? "Foto anterior" : "Próxima foto"}
      className={cn(
        "absolute top-1/2 inline-flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-ink shadow-md transition-colors hover:bg-white",
        lado === "esquerda" ? "left-3" : "right-3",
      )}
    >
      <Icone size={20} />
    </button>
  );
}
