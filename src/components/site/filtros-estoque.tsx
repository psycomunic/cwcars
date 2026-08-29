"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Botao, Campo, Rotulo, Selecao } from "@/components/ui";
import { CAMBIO, CARROCERIA, COMBUSTIVEL, CONDICAO, opcoes } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { FiltrosVeiculo } from "@/lib/veiculos";

export type DadosFiltro = {
  marcas: Array<{ nome: string; slug: string; _count: { veiculos: number } }>;
  modelos: Array<{ nome: string; slug: string; marca: { slug: string } }>;
  cores: string[];
  precoMin: number;
  precoMax: number;
  anoMin: number;
  anoMax: number;
};

export function FiltrosEstoque({
  dados,
  filtros,
}: {
  dados: DadosFiltro;
  filtros: FiltrosVeiculo;
}) {
  const form = useRef<HTMLFormElement>(null);
  const [marca, setMarca] = useState(filtros.marca ?? "");
  const [abertoMobile, setAbertoMobile] = useState(false);

  const modelos = marca
    ? dados.modelos.filter((m) => m.marca.slug === marca)
    : dados.modelos;

  const enviar = () => form.current?.requestSubmit();

  return (
    <>
      <button
        type="button"
        onClick={() => setAbertoMobile((v) => !v)}
        className="mb-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-line bg-surface px-4 py-3 text-sm font-semibold lg:hidden"
      >
        <SlidersHorizontal size={16} />
        {abertoMobile ? "Ocultar filtros" : "Filtrar veículos"}
      </button>

      <form
        ref={form}
        action="/estoque"
        method="get"
        className={cn(
          "space-y-5 rounded-[var(--radius)] border border-line bg-surface p-5",
          !abertoMobile && "hidden lg:block",
        )}
      >
        {/* ordenação e página não são controladas aqui; resetam a cada filtro */}
        <input type="hidden" name="ordenar" value={filtros.ordenar ?? "recentes"} />

        <Bloco titulo="Busca livre">
          <Campo
            name="q"
            defaultValue={filtros.q ?? ""}
            placeholder="Ex.: Corolla XEI 2023"
          />
        </Bloco>

        <Bloco titulo="Marca">
          <Selecao
            name="marca"
            value={marca}
            onChange={(e) => {
              setMarca(e.target.value);
              queueMicrotask(enviar);
            }}
          >
            <option value="">Todas as marcas</option>
            {dados.marcas.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.nome} ({m._count.veiculos})
              </option>
            ))}
          </Selecao>
        </Bloco>

        <Bloco titulo="Modelo">
          <Selecao
            name="modelo"
            defaultValue={filtros.modelo ?? ""}
            onChange={enviar}
          >
            <option value="">Todos os modelos</option>
            {modelos.map((m) => (
              <option key={`${m.marca.slug}-${m.slug}`} value={m.slug}>
                {m.nome}
              </option>
            ))}
          </Selecao>
        </Bloco>

        <Bloco titulo="Preço (R$)">
          <div className="grid grid-cols-2 gap-2">
            <Campo
              name="precoMin"
              inputMode="numeric"
              placeholder={String(dados.precoMin)}
              defaultValue={filtros.precoMin ?? ""}
              aria-label="Preço mínimo"
            />
            <Campo
              name="precoMax"
              inputMode="numeric"
              placeholder={String(dados.precoMax)}
              defaultValue={filtros.precoMax ?? ""}
              aria-label="Preço máximo"
            />
          </div>
        </Bloco>

        <Bloco titulo="Ano do modelo">
          <div className="grid grid-cols-2 gap-2">
            <Campo
              name="anoMin"
              inputMode="numeric"
              placeholder={String(dados.anoMin)}
              defaultValue={filtros.anoMin ?? ""}
              aria-label="Ano mínimo"
            />
            <Campo
              name="anoMax"
              inputMode="numeric"
              placeholder={String(dados.anoMax)}
              defaultValue={filtros.anoMax ?? ""}
              aria-label="Ano máximo"
            />
          </div>
        </Bloco>

        <Bloco titulo="Quilometragem máxima">
          <Selecao name="kmMax" defaultValue={filtros.kmMax ?? ""} onChange={enviar}>
            <option value="">Qualquer</option>
            {[10_000, 30_000, 50_000, 80_000, 120_000].map((v) => (
              <option key={v} value={v}>
                até {v.toLocaleString("pt-BR")} km
              </option>
            ))}
          </Selecao>
        </Bloco>

        <Bloco titulo="Carroceria">
          <Selecao
            name="carroceria"
            defaultValue={filtros.carroceria ?? ""}
            onChange={enviar}
          >
            <option value="">Todas</option>
            {opcoes(CARROCERIA).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Selecao>
        </Bloco>

        <Bloco titulo="Câmbio">
          <Selecao name="cambio" defaultValue={filtros.cambio ?? ""} onChange={enviar}>
            <option value="">Todos</option>
            {opcoes(CAMBIO).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Selecao>
        </Bloco>

        <Bloco titulo="Combustível">
          <Selecao
            name="combustivel"
            defaultValue={filtros.combustivel ?? ""}
            onChange={enviar}
          >
            <option value="">Todos</option>
            {opcoes(COMBUSTIVEL).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Selecao>
        </Bloco>

        <Bloco titulo="Condição">
          <Selecao
            name="condicao"
            defaultValue={filtros.condicao ?? ""}
            onChange={enviar}
          >
            <option value="">Todas</option>
            {opcoes(CONDICAO).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Selecao>
        </Bloco>

        {dados.cores.length > 1 && (
          <Bloco titulo="Cor">
            <Selecao name="cor" defaultValue={filtros.cor ?? ""} onChange={enviar}>
              <option value="">Todas</option>
              {dados.cores.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Selecao>
          </Bloco>
        )}

        <div className="flex gap-2 pt-1">
          <Botao type="submit" className="flex-1">
            Aplicar filtros
          </Botao>
          <Link
            href="/estoque"
            aria-label="Limpar filtros"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-line text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            <X size={17} />
          </Link>
        </div>
      </form>
    </>
  );
}

function Bloco({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Rotulo className="text-[11px] font-bold uppercase tracking-wider text-text">
        {titulo}
      </Rotulo>
      {children}
    </div>
  );
}
