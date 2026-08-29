"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { enviarTroca } from "@/acoes/leads";
import { ESTADO_INICIAL } from "@/lib/estados-formulario";
import { AreaTexto, Botao, Campo, GrupoCampo } from "@/components/ui";
import { telefoneMascara } from "@/lib/format";

function mascaraPlaca(v: string) {
  return v
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 7)
    .replace(/^([A-Z]{3})(\d)/, "$1-$2");
}

export function FormularioTroca() {
  const [estado, acao, enviando] = useActionState(enviarTroca, ESTADO_INICIAL);
  const [placa, setPlaca] = useState("");
  const [telefone, setTelefone] = useState("");

  if (estado.ok) {
    return (
      <div className="rounded-[var(--radius)] border border-success/25 bg-success/8 p-8 text-center">
        <CheckCircle2 size={40} className="mx-auto mb-3 text-success" />
        <p className="text-base font-bold text-text">{estado.mensagem}</p>
        <p className="mt-1.5 text-sm text-text-muted">
          Nossa equipe analisa o veículo e retorna com uma proposta.
        </p>
      </div>
    );
  }

  return (
    <form action={acao} className="space-y-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
        Sobre o seu veículo
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <GrupoCampo
          rotulo="Placa"
          obrigatorio
          htmlFor="troca-placa"
          erro={estado.erros?.trocaPlaca}
        >
          <Campo
            id="troca-placa"
            name="trocaPlaca"
            placeholder="ABC-1234"
            value={placa}
            onChange={(e) => setPlaca(mascaraPlaca(e.target.value))}
            required
          />
        </GrupoCampo>

        <GrupoCampo
          rotulo="Marca"
          obrigatorio
          htmlFor="troca-marca"
          erro={estado.erros?.trocaMarca}
        >
          <Campo id="troca-marca" name="trocaMarca" placeholder="Ex.: Toyota" required />
        </GrupoCampo>

        <GrupoCampo
          rotulo="Modelo e versão"
          obrigatorio
          htmlFor="troca-modelo"
          erro={estado.erros?.trocaModelo}
        >
          <Campo
            id="troca-modelo"
            name="trocaModelo"
            placeholder="Ex.: Corolla XEI 2.0"
            required
          />
        </GrupoCampo>

        <div className="grid grid-cols-2 gap-4">
          <GrupoCampo
            rotulo="Ano do modelo"
            obrigatorio
            htmlFor="troca-ano"
            erro={estado.erros?.trocaAno}
          >
            <Campo
              id="troca-ano"
              name="trocaAno"
              inputMode="numeric"
              placeholder="2020"
              required
            />
          </GrupoCampo>

          <GrupoCampo
            rotulo="KM rodados"
            obrigatorio
            htmlFor="troca-km"
            erro={estado.erros?.trocaKm}
          >
            <Campo
              id="troca-km"
              name="trocaKm"
              inputMode="numeric"
              placeholder="45000"
              required
            />
          </GrupoCampo>
        </div>
      </div>

      <div className="border-t border-line pt-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Seus dados
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <GrupoCampo
            rotulo="Nome completo"
            obrigatorio
            htmlFor="troca-nome"
            erro={estado.erros?.nome}
          >
            <Campo id="troca-nome" name="nome" required />
          </GrupoCampo>

          <GrupoCampo
            rotulo="E-mail"
            obrigatorio
            htmlFor="troca-email"
            erro={estado.erros?.email}
          >
            <Campo id="troca-email" name="email" type="email" required />
          </GrupoCampo>

          <GrupoCampo
            rotulo="Telefone"
            obrigatorio
            htmlFor="troca-tel"
            erro={estado.erros?.telefone}
            className="sm:col-span-2"
          >
            <Campo
              id="troca-tel"
              name="telefone"
              inputMode="tel"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={(e) => setTelefone(telefoneMascara(e.target.value))}
              required
            />
          </GrupoCampo>

          <GrupoCampo
            rotulo="Detalhes do veículo"
            htmlFor="troca-msg"
            className="sm:col-span-2"
            ajuda="Estado de conservação, itens opcionais, pendências, etc."
          >
            <AreaTexto id="troca-msg" name="mensagem" rows={3} />
          </GrupoCampo>
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          name="aceitaContato"
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--brand)]"
        />
        <span className="text-xs leading-snug text-text-muted">
          Autorizo o contato por e-mail, telefone e WhatsApp sobre esta avaliação.
        </span>
      </label>

      {estado.mensagem && !estado.ok && (
        <p className="rounded-[var(--radius-sm)] bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
          {estado.mensagem}
        </p>
      )}

      <Botao type="submit" tamanho="lg" disabled={enviando}>
        {enviando ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Enviando…
          </>
        ) : (
          "Solicitar avaliação"
        )}
      </Botao>
    </form>
  );
}
