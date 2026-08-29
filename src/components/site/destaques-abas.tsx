"use client";

import { useState } from "react";
import { VeiculoCard } from "@/components/veiculo-card";
import { Vazio } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { VeiculoCard as Veiculo } from "@/lib/veiculos";

const ABAS = [
  { chave: "TODOS", label: "Todos" },
  { chave: "SEDA", label: "Sedãs" },
  { chave: "SUV", label: "SUVs" },
  { chave: "PICAPE", label: "Picapes" },
  { chave: "HATCH", label: "Hatches" },
  { chave: "COUPE", label: "Coupés" },
] as const;

export function DestaquesAbas({ veiculos }: { veiculos: Veiculo[] }) {
  const [aba, setAba] = useState<string>("TODOS");

  const disponiveis = ABAS.filter(
    (a) =>
      a.chave === "TODOS" || veiculos.some((v) => v.carroceria === a.chave),
  );

  const lista =
    aba === "TODOS" ? veiculos : veiculos.filter((v) => v.carroceria === aba);

  return (
    <>
      <div className="mb-8 flex flex-wrap justify-center gap-1">
        {disponiveis.map((a) => (
          <button
            key={a.chave}
            type="button"
            onClick={() => setAba(a.chave)}
            className={cn(
              "relative cursor-pointer px-4 py-2 text-[13px] font-bold uppercase tracking-wide transition-colors",
              aba === a.chave ? "text-brand" : "text-text-muted hover:text-text",
            )}
          >
            {a.label}
            {aba === a.chave && (
              <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand" />
            )}
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <Vazio
          titulo="Nenhum veículo nesta categoria"
          descricao="Confira as outras abas ou veja o estoque completo."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {lista.slice(0, 8).map((v, i) => (
            <VeiculoCard key={v.id} veiculo={v} prioridade={i < 4} />
          ))}
        </div>
      )}
    </>
  );
}
