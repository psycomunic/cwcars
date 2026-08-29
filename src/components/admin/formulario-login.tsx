"use client";

import { useActionState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { acaoEntrar } from "@/acoes/autenticacao";
import { ESTADO_LOGIN } from "@/lib/estados-formulario";
import { Botao, Campo, GrupoCampo } from "@/components/ui";

export function FormularioLogin({ proximo }: { proximo?: string }) {
  const [estado, acao, enviando] = useActionState(acaoEntrar, ESTADO_LOGIN);

  return (
    <form action={acao} className="space-y-4">
      <h1 className="text-lg font-bold text-text">Entrar</h1>

      {proximo && <input type="hidden" name="proximo" value={proximo} />}

      <GrupoCampo rotulo="E-mail" obrigatorio htmlFor="login-email" erro={estado.erros?.email}>
        <Campo
          id="login-email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="voce@loja.com.br"
          required
        />
      </GrupoCampo>

      <GrupoCampo rotulo="Senha" obrigatorio htmlFor="login-senha" erro={estado.erros?.senha}>
        <Campo
          id="login-senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </GrupoCampo>

      {estado.erro && (
        <p className="rounded-[var(--radius-sm)] bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
          {estado.erro}
        </p>
      )}

      <Botao type="submit" disabled={enviando} className="w-full">
        {enviando ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Entrando…
          </>
        ) : (
          <>
            <LogIn size={16} /> Entrar
          </>
        )}
      </Botao>
    </form>
  );
}
