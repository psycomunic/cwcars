"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { enviarLead } from "@/acoes/leads";
import { ESTADO_INICIAL } from "@/lib/estados-formulario";
import { AreaTexto, Botao, Campo, GrupoCampo } from "@/components/ui";
import { telefoneMascara } from "@/lib/format";
import { cn } from "@/lib/utils";

export function FormularioLead({
  veiculoId,
  origem = "DETALHE_VEICULO",
  titulo,
  mensagemPadrao = "Olá, tenho interesse no veículo. Por favor entre em contato.",
  compacto = false,
}: {
  veiculoId?: string;
  origem?: "DETALHE_VEICULO" | "CONTATO";
  titulo?: string;
  mensagemPadrao?: string;
  compacto?: boolean;
}) {
  const [estado, acao, enviando] = useActionState(enviarLead, ESTADO_INICIAL);
  const [telefone, setTelefone] = useState("");

  if (estado.ok) {
    return (
      <div className="rounded-[var(--radius)] border border-success/25 bg-success/8 p-6 text-center">
        <CheckCircle2 size={34} className="mx-auto mb-3 text-success" />
        <p className="text-sm font-semibold text-text">{estado.mensagem}</p>
        <p className="mt-1 text-xs text-text-muted">
          Fique de olho no seu e-mail e no WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form action={acao} className={cn("space-y-3", compacto && "space-y-2.5")}>
      {titulo && (
        <p className="text-sm font-semibold text-text">{titulo}</p>
      )}

      <input type="hidden" name="origem" value={origem} />
      {veiculoId && <input type="hidden" name="veiculoId" value={veiculoId} />}

      <GrupoCampo rotulo="Nome" obrigatorio htmlFor="lead-nome" erro={estado.erros?.nome}>
        <Campo id="lead-nome" name="nome" placeholder="Seu nome completo" required />
      </GrupoCampo>

      <GrupoCampo rotulo="E-mail" obrigatorio htmlFor="lead-email" erro={estado.erros?.email}>
        <Campo
          id="lead-email"
          name="email"
          type="email"
          placeholder="voce@email.com"
          required
        />
      </GrupoCampo>

      <GrupoCampo
        rotulo="Telefone"
        obrigatorio
        htmlFor="lead-telefone"
        erro={estado.erros?.telefone}
      >
        <Campo
          id="lead-telefone"
          name="telefone"
          inputMode="tel"
          placeholder="(00) 00000-0000"
          value={telefone}
          onChange={(e) => setTelefone(telefoneMascara(e.target.value))}
          required
        />
      </GrupoCampo>

      <GrupoCampo rotulo="Mensagem" htmlFor="lead-mensagem" erro={estado.erros?.mensagem}>
        <AreaTexto
          id="lead-mensagem"
          name="mensagem"
          defaultValue={mensagemPadrao}
          rows={3}
        />
      </GrupoCampo>

      <label className="flex cursor-pointer items-start gap-2.5 pt-0.5">
        <input
          type="checkbox"
          name="aceitaContato"
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--brand)]"
        />
        <span className="text-[11px] leading-snug text-text-muted">
          Quero receber contatos e ofertas por e-mail, WhatsApp e outros canais.
        </span>
      </label>

      {estado.mensagem && !estado.ok && (
        <p className="rounded-[var(--radius-sm)] bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
          {estado.mensagem}
        </p>
      )}

      <Botao type="submit" disabled={enviando} className="w-full">
        {enviando ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Enviando…
          </>
        ) : (
          <>
            <Send size={15} />
            Enviar mensagem
          </>
        )}
      </Botao>
    </form>
  );
}
