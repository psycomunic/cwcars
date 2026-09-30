"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { KeyRound, Loader2, UserPlus } from "lucide-react";
import {
  criarUsuario,
  definirSenha,
  trocarMinhaSenha,
} from "@/acoes/usuarios";
import { ESTADO_SIMPLES } from "@/lib/estados-formulario";
import { NOME_DO_PAPEL, PAPEIS, RESUMO_DO_PAPEL } from "@/lib/permissoes";
import { Botao, Campo, GrupoCampo, Selecao } from "@/components/ui";
import type { EstadoFormulario } from "@/lib/estados-formulario";

function Mensagem({ estado }: { estado: EstadoFormulario }) {
  if (!estado.mensagem) return null;
  return (
    <p
      className={
        estado.ok
          ? "text-[13px] font-medium text-success"
          : "text-[13px] font-medium text-danger"
      }
    >
      {estado.mensagem}
    </p>
  );
}

export function FormularioNovoUsuario() {
  const [estado, acao, enviando] = useActionState(criarUsuario, ESTADO_SIMPLES);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) form.current?.reset();
  }, [estado.ok]);

  return (
    <form ref={form} action={acao} className="space-y-3">
      <GrupoCampo rotulo="Nome" obrigatorio erro={estado.erros?.nome}>
        <Campo name="nome" placeholder="Ex.: Caio" required autoComplete="off" />
      </GrupoCampo>

      <GrupoCampo rotulo="E-mail" obrigatorio erro={estado.erros?.email}>
        <Campo
          name="email"
          type="email"
          placeholder="pessoa@cwmotors.com.br"
          required
          autoComplete="off"
        />
      </GrupoCampo>

      <GrupoCampo
        rotulo="Senha"
        obrigatorio
        erro={estado.erros?.senha}
        ajuda="Ao menos 8 caracteres. Quem receber pode trocar depois."
      >
        <Campo name="senha" type="password" required autoComplete="new-password" />
      </GrupoCampo>

      <GrupoCampo rotulo="Papel" obrigatorio erro={estado.erros?.papel}>
        <Selecao name="papel" defaultValue="VENDEDOR">
          {PAPEIS.map((papel) => (
            <option key={papel} value={papel}>
              {NOME_DO_PAPEL[papel]} — {RESUMO_DO_PAPEL[papel]}
            </option>
          ))}
        </Selecao>
      </GrupoCampo>

      <Mensagem estado={estado} />

      <Botao type="submit" disabled={enviando}>
        {enviando ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Criando…
          </>
        ) : (
          <>
            <UserPlus size={16} /> Criar usuário
          </>
        )}
      </Botao>
    </form>
  );
}

/** Administrador define a senha de outra pessoa. */
export function FormularioDefinirSenha({
  id,
  nome,
}: {
  id: string;
  nome: string;
}) {
  const [estado, acao, enviando] = useActionState(definirSenha, ESTADO_SIMPLES);
  const [aberto, setAberto] = useState(false);

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-line px-2.5 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
      >
        <KeyRound size={13} /> Definir senha
      </button>
    );
  }

  return (
    <form action={acao} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="id" value={id} />
      <GrupoCampo
        rotulo={`Nova senha de ${nome}`}
        erro={estado.erros?.senha}
        className="min-w-[200px] flex-1"
      >
        <Campo name="senha" type="password" required autoComplete="new-password" />
      </GrupoCampo>
      <Botao type="submit" tamanho="sm" disabled={enviando}>
        {enviando ? <Loader2 size={14} className="animate-spin" /> : "Salvar"}
      </Botao>
      <Botao
        type="button"
        tamanho="sm"
        variante="contorno"
        onClick={() => setAberto(false)}
      >
        Cancelar
      </Botao>
      <Mensagem estado={estado} />
    </form>
  );
}

/** Qualquer pessoa troca a própria senha. */
export function FormularioMinhaSenha() {
  const [estado, acao, enviando] = useActionState(
    trocarMinhaSenha,
    ESTADO_SIMPLES,
  );
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) form.current?.reset();
  }, [estado.ok]);

  return (
    <form ref={form} action={acao} className="space-y-3">
      <GrupoCampo rotulo="Senha atual" obrigatorio erro={estado.erros?.atual}>
        <Campo name="atual" type="password" required autoComplete="current-password" />
      </GrupoCampo>
      <GrupoCampo rotulo="Nova senha" obrigatorio erro={estado.erros?.nova}>
        <Campo name="nova" type="password" required autoComplete="new-password" />
      </GrupoCampo>
      <GrupoCampo
        rotulo="Repita a nova senha"
        obrigatorio
        erro={estado.erros?.confirmacao}
      >
        <Campo
          name="confirmacao"
          type="password"
          required
          autoComplete="new-password"
        />
      </GrupoCampo>

      <Mensagem estado={estado} />

      <Botao type="submit" disabled={enviando}>
        {enviando ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Salvando…
          </>
        ) : (
          <>
            <KeyRound size={16} /> Trocar minha senha
          </>
        )}
      </Botao>
    </form>
  );
}
