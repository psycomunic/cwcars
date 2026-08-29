"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Gauge,
  MapPin,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import { FotoVeiculo } from "@/components/foto-veiculo";
import { Selo } from "@/components/ui";
import { CAMBIO } from "@/lib/labels";
import { km, moeda } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { VeiculoCard as Veiculo } from "@/lib/veiculos";

export function VeiculoCard({
  veiculo,
  className,
  prioridade = false,
}: {
  veiculo: Veiculo;
  className?: string;
  prioridade?: boolean;
}) {
  const titulo = `${veiculo.marca.nome} ${veiculo.modelo.nome}`;
  const fotos = veiculo.imagens;
  const [atual, setAtual] = useState(0);
  const inicioToque = useRef<number | null>(null);

  const total = Math.max(fotos.length, 1);
  const foto = fotos[atual];

  const irPara = (i: number) => setAtual(((i % total) + total) % total);

  /** as setas ficam dentro da área do link: não podem navegar junto */
  const navegar = (e: React.MouseEvent, passo: number) => {
    e.preventDefault();
    e.stopPropagation();
    irPara(atual + passo);
  };

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-[var(--radius)] border border-line bg-surface",
        "transition-shadow hover:shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div
        className="relative aspect-[4/3] overflow-hidden bg-surface-3"
        onTouchStart={(e) => {
          inicioToque.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (inicioToque.current === null) return;
          const distancia = e.changedTouches[0].clientX - inicioToque.current;
          if (Math.abs(distancia) > 40) irPara(atual + (distancia < 0 ? 1 : -1));
          inicioToque.current = null;
        }}
      >
        <FotoVeiculo
          url={foto?.url}
          alt={foto?.alt || titulo}
          priority={prioridade && atual === 0}
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />

        {/* área clicável que leva para a página do veículo */}
        <Link
          href={`/veiculo/${veiculo.slug}`}
          aria-label={`Ver detalhes do ${veiculo.anoModelo} ${titulo}`}
          className="absolute inset-0 z-10"
        />

        <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-[4px] bg-ink/90 px-2 py-1 text-[11px] font-bold text-white">
          {veiculo.anoModelo}
        </span>

        {veiculo.blindado && (
          <span className="pointer-events-none absolute right-3 top-3 z-20">
            <Selo tom="escuro">
              <ShieldCheck size={12} /> Blindado
            </Selo>
          </span>
        )}

        {veiculo.status === "RESERVADO" && (
          <span className="pointer-events-none absolute left-3 top-11 z-20">
            <Selo tom="aviso">Reservado</Selo>
          </span>
        )}

        {total > 1 && (
          <>
            <SetaFoto lado="esquerda" aoClicar={(e) => navegar(e, -1)} />
            <SetaFoto lado="direita" aoClicar={(e) => navegar(e, 1)} />

            <div className="pointer-events-none absolute inset-x-0 bottom-2.5 z-20 flex justify-center gap-1.5">
              {fotos.map((f, i) => (
                <span
                  key={f.id}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-200",
                    i === atual ? "w-4 bg-white" : "w-1.5 bg-white/55",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[15px] font-bold leading-snug text-text">
          <Link
            href={`/veiculo/${veiculo.slug}`}
            className="transition-colors hover:text-brand"
          >
            {veiculo.anoModelo} {titulo}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-1 text-xs uppercase tracking-wide text-text-muted">
          {veiculo.versao}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Gauge size={14} className="text-text-muted/70" />
            {km(veiculo.quilometragem)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Settings2 size={14} className="text-text-muted/70" />
            {CAMBIO[veiculo.cambio]}
          </span>
          {veiculo.cidade && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} className="text-text-muted/70" />
              {veiculo.cidade} - {veiculo.estado}
            </span>
          )}
        </div>

        <div className="mt-auto pt-4">
          {veiculo.precoDeCentavos &&
          veiculo.precoDeCentavos > veiculo.precoCentavos ? (
            <p className="text-xs text-text-muted line-through">
              {moeda(veiculo.precoDeCentavos)}
            </p>
          ) : null}
          <p className="text-xl font-extrabold tracking-tight text-text">
            {moeda(veiculo.precoCentavos)}
          </p>

          <Link
            href={`/veiculo/${veiculo.slug}`}
            className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-brand transition-colors hover:text-brand-hover"
          >
            Ver detalhes
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

function SetaFoto({
  lado,
  aoClicar,
}: {
  lado: "esquerda" | "direita";
  aoClicar: (e: React.MouseEvent) => void;
}) {
  const Icone = lado === "esquerda" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={aoClicar}
      aria-label={lado === "esquerda" ? "Foto anterior" : "Próxima foto"}
      className={cn(
        "absolute top-1/2 z-20 inline-flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center",
        "rounded-full bg-white/90 text-ink shadow-md transition-opacity hover:bg-white",
        // no celular ficam sempre visíveis; no desktop aparecem no hover
        "opacity-90 md:opacity-0 md:group-hover:opacity-100",
        lado === "esquerda" ? "left-2" : "right-2",
      )}
    >
      <Icone size={17} />
    </button>
  );
}
