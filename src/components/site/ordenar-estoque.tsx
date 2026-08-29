"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Selecao } from "@/components/ui";
import { ORDENACOES, type Ordenacao } from "@/lib/ordenacao";

export function OrdenarEstoque({ valor }: { valor: Ordenacao }) {
  const router = useRouter();
  const params = useSearchParams();

  function mudar(novo: string) {
    const busca = new URLSearchParams(params.toString());
    busca.set("ordenar", novo);
    busca.delete("pagina");
    router.push(`/estoque?${busca.toString()}`);
  }

  return (
    <label className="flex shrink-0 items-center gap-2 text-xs text-text-muted">
      Ordenar por
      <Selecao
        value={valor}
        onChange={(e) => mudar(e.target.value)}
        className="h-10 w-52 text-[13px]"
        aria-label="Ordenar resultados"
      >
        {ORDENACOES.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Selecao>
    </label>
  );
}
