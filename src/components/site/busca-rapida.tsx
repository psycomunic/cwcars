"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { Botao, Selecao } from "@/components/ui";
import { CARROCERIA, opcoes } from "@/lib/labels";

export type OpcoesBusca = {
  marcas: Array<{ nome: string; slug: string }>;
  modelos: Array<{ nome: string; slug: string; marca: { slug: string } }>;
  precoMax: number;
};

const FAIXAS_PRECO = [50_000, 80_000, 120_000, 160_000, 200_000, 300_000, 500_000];

/**
 * Barra de busca do topo da home. Envia via GET para /estoque,
 * então os filtros ficam na URL e a página continua sendo server component.
 */
export function BuscaRapida({ opcoes: dados }: { opcoes: OpcoesBusca }) {
  const [marca, setMarca] = useState("");

  const modelosDisponiveis = marca
    ? dados.modelos.filter((m) => m.marca.slug === marca)
    : dados.modelos;

  const faixas = FAIXAS_PRECO.filter((f) => f <= dados.precoMax * 1.2);

  return (
    <form
      action="/estoque"
      method="get"
      className="rounded-[var(--radius)] bg-ink/95 p-5 shadow-[var(--shadow-pop)] backdrop-blur md:p-6"
    >
      <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
        Buscar no estoque
      </p>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[repeat(4,1fr)_auto]">
        <CampoBusca rotulo="Marca">
          <Selecao
            name="marca"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
          >
            <option value="">Todas as marcas</option>
            {dados.marcas.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.nome}
              </option>
            ))}
          </Selecao>
        </CampoBusca>

        <CampoBusca rotulo="Modelo">
          <Selecao name="modelo" defaultValue="">
            <option value="">Todos os modelos</option>
            {modelosDisponiveis.map((m) => (
              <option key={`${m.marca.slug}-${m.slug}`} value={m.slug}>
                {m.nome}
              </option>
            ))}
          </Selecao>
        </CampoBusca>

        <CampoBusca rotulo="Carroceria">
          <Selecao name="carroceria" defaultValue="">
            <option value="">Todas</option>
            {opcoes(CARROCERIA).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Selecao>
        </CampoBusca>

        <CampoBusca rotulo="Preço até">
          <Selecao name="precoMax" defaultValue="">
            <option value="">Qualquer valor</option>
            {faixas.map((f) => (
              <option key={f} value={f}>
                R$ {f.toLocaleString("pt-BR")}
              </option>
            ))}
          </Selecao>
        </CampoBusca>

        <div className="flex items-end">
          <Botao type="submit" tamanho="md" className="h-11 w-full lg:w-36">
            <Search size={16} />
            Buscar
          </Botao>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Link
          href="/estoque"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 transition-colors hover:text-white"
        >
          <SlidersHorizontal size={13} />
          Busca avançada
        </Link>
      </div>
    </form>
  );
}

function CampoBusca({
  rotulo,
  children,
}: {
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-white/60">
        {rotulo}
      </span>
      {children}
    </label>
  );
}
