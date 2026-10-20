"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, Plus, Power, RotateCcw, Trash2 } from "lucide-react";
import {
  alternarAtendente,
  criarAtendente,
  excluirAtendente,
  zerarRodizio,
} from "@/acoes/admin";
import { ESTADO_SIMPLES } from "@/lib/estados-formulario";
import { Botao, Campo, GrupoCampo, Selo } from "@/components/ui";

export type Atendente = {
  id: string;
  nome: string;
  telefone: string;
  ativo: boolean;
  atendimentos: number;
};

/**
 * Fila do botão de WhatsApp do site.
 *
 * Cada clique vai para quem atendeu menos até agora, então os leads se dividem
 * entre os sócios. O placar abaixo é o que decide a vez — por isso ele aparece.
 */
export function AtendentesWhatsapp({ atendentes }: { atendentes: Atendente[] }) {
  const [estado, acao, enviando] = useActionState(criarAtendente, ESTADO_SIMPLES);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) form.current?.reset();
  }, [estado.ok]);

  const ativos = atendentes.filter((a) => a.ativo);
  const total = atendentes.reduce((s, a) => s + a.atendimentos, 0);
  const proximo = ativos
    .slice()
    .sort((a, b) => a.atendimentos - b.atendimentos)[0];

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-muted">
        Cada clique no botão de WhatsApp do site vai para um número diferente,
        em rodízio, para os leads se dividirem. A vez é sempre de quem atendeu
        menos.
      </p>

      {atendentes.length === 0 ? (
        <p className="rounded-[var(--radius-sm)] border border-warning/30 bg-warning/8 px-3.5 py-2.5 text-[13px] text-text">
          Nenhum número na fila. Enquanto estiver assim, o botão usa o WhatsApp
          da loja, logo acima.
        </p>
      ) : (
        <ul className="space-y-2">
          {atendentes.map((atendente) => (
            <li
              key={atendente.id}
              className="flex flex-wrap items-center gap-3 rounded-[var(--radius-sm)] border border-line px-3.5 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-text">
                    {atendente.nome || atendente.telefone}
                  </span>
                  {!atendente.ativo && <Selo tom="perigo">fora da fila</Selo>}
                  {atendente.ativo && proximo?.id === atendente.id && (
                    <Selo tom="sucesso">próximo</Selo>
                  )}
                </div>
                {atendente.nome && (
                  <p className="text-[13px] text-text-muted">
                    {atendente.telefone}
                  </p>
                )}
              </div>

              <div className="text-right">
                <p className="text-xs text-text-muted">Atendimentos</p>
                <p className="text-sm font-bold text-text">
                  {atendente.atendimentos}
                </p>
              </div>

              <form action={alternarAtendente}>
                <input type="hidden" name="id" value={atendente.id} />
                <button
                  type="submit"
                  title={
                    atendente.ativo
                      ? "Tirar da fila (deixa de receber cliques)"
                      : "Voltar para a fila"
                  }
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-line text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
                >
                  <Power size={15} />
                </button>
              </form>

              <form
                action={excluirAtendente}
                onSubmit={(e) => {
                  const quem = atendente.nome || atendente.telefone;
                  if (!confirm(`Remover ${quem} do rodízio?`)) {
                    e.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="id" value={atendente.id} />
                <button
                  type="submit"
                  title="Remover do rodízio"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-line text-text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 size={15} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form ref={form} action={acao} className="flex flex-wrap items-end gap-2">
        <GrupoCampo
          rotulo="Nome (opcional)"
          erro={estado.erros?.nome}
          ajuda="Só para você saber de quem é. O cliente não vê."
          className="min-w-[160px] flex-1"
        >
          <Campo name="nome" placeholder="Ex.: Caio" className="h-9 text-[13px]" />
        </GrupoCampo>
        <GrupoCampo
          rotulo="WhatsApp"
          erro={estado.erros?.telefone}
          className="min-w-[160px] flex-1"
        >
          <Campo
            name="telefone"
            placeholder="31 99999-9999"
            required
            className="h-9 text-[13px]"
          />
        </GrupoCampo>
        <Botao type="submit" tamanho="sm" disabled={enviando}>
          {enviando ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <>
              <Plus size={14} /> Adicionar
            </>
          )}
        </Botao>
      </form>

      {estado.mensagem && (
        <p
          className={
            estado.ok
              ? "text-[13px] font-medium text-success"
              : "text-[13px] font-medium text-danger"
          }
        >
          {estado.mensagem}
        </p>
      )}

      {total > 0 && (
        <form action={zerarRodizio} className="border-t border-line pt-3">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted transition-colors hover:text-text"
          >
            <RotateCcw size={13} /> Zerar o placar ({total} atendimentos)
          </button>
        </form>
      )}
    </div>
  );
}
