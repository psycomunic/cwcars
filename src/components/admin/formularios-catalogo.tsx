"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, Plus } from "lucide-react";
import { criarMarca, criarModelo } from "@/acoes/admin";
import { ESTADO_SIMPLES } from "@/lib/estados-formulario";
import { Botao, Campo, GrupoCampo, Rotulo, Selecao } from "@/components/ui";

export function FormularioMarca() {
  const [estado, acao, enviando] = useActionState(criarMarca, ESTADO_SIMPLES);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) form.current?.reset();
  }, [estado.ok]);

  return (
    <form ref={form} action={acao} className="space-y-3">
      <GrupoCampo rotulo="Nome da marca" obrigatorio erro={estado.erros?.nome}>
        <Campo name="nome" placeholder="Ex.: Renault" required />
      </GrupoCampo>

      <Rotulo className="flex cursor-pointer items-center gap-2.5 text-[13px] text-text">
        <input
          type="checkbox"
          name="destaque"
          className="h-4 w-4 cursor-pointer accent-[var(--brand)]"
        />
        Mostrar na faixa de marcas da página inicial
      </Rotulo>

      <Mensagem estado={estado} />

      <Botao type="submit" disabled={enviando}>
        {enviando ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Salvando…
          </>
        ) : (
          <>
            <Plus size={16} /> Adicionar marca
          </>
        )}
      </Botao>
    </form>
  );
}

export function FormularioModelo({
  marcas,
}: {
  marcas: Array<{ id: string; nome: string }>;
}) {
  const [estado, acao, enviando] = useActionState(criarModelo, ESTADO_SIMPLES);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) form.current?.reset();
  }, [estado.ok]);

  return (
    <form ref={form} action={acao} className="space-y-3">
      <GrupoCampo rotulo="Marca" obrigatorio erro={estado.erros?.marcaId}>
        <Selecao name="marcaId" defaultValue="" required>
          <option value="">Selecione…</option>
          {marcas.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </Selecao>
      </GrupoCampo>

      <GrupoCampo rotulo="Nome do modelo" obrigatorio erro={estado.erros?.nome}>
        <Campo name="nome" placeholder="Ex.: Kwid" required />
      </GrupoCampo>

      <Mensagem estado={estado} />

      <Botao type="submit" disabled={enviando}>
        {enviando ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Salvando…
          </>
        ) : (
          <>
            <Plus size={16} /> Adicionar modelo
          </>
        )}
      </Botao>
    </form>
  );
}

function Mensagem({
  estado,
}: {
  estado: { ok: boolean; mensagem?: string };
}) {
  if (!estado.mensagem) return null;
  return (
    <p
      className={
        estado.ok
          ? "rounded-[var(--radius-sm)] bg-success/10 px-3 py-2 text-xs font-medium text-success"
          : "rounded-[var(--radius-sm)] bg-danger/10 px-3 py-2 text-xs font-medium text-danger"
      }
    >
      {estado.mensagem}
    </p>
  );
}
