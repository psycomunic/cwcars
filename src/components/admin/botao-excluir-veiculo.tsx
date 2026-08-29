"use client";

import { Trash2 } from "lucide-react";
import { excluirVeiculo } from "@/acoes/veiculos";

export function BotaoExcluirVeiculo({
  id,
  nome,
}: {
  id: string;
  nome: string;
}) {
  return (
    <form
      action={excluirVeiculo}
      onSubmit={(e) => {
        const confirmado = window.confirm(
          `Excluir "${nome}"? As fotos e os vínculos com leads deste veículo também serão removidos. Esta ação não pode ser desfeita.`,
        );
        if (!confirmado) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        title="Excluir"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-text-muted transition-colors hover:bg-danger/10 hover:text-danger"
      >
        <Trash2 size={16} />
      </button>
    </form>
  );
}
