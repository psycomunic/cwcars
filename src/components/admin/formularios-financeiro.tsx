"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Loader2, Plus, Receipt, Save, Trash2 } from "lucide-react";
import {
  excluirDespesa,
  lancarDespesa,
  registrarVenda,
  salvarCustoAquisicao,
} from "@/acoes/financeiro";
import { ESTADO_SIMPLES } from "@/lib/estados-formulario";
import { CATEGORIA_DESPESA, opcoes } from "@/lib/labels";
import { moedaExata } from "@/lib/format";
import { AreaTexto, Botao, Campo, GrupoCampo, Selecao } from "@/components/ui";
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

/** Hoje em AAAA-MM-DD, para pré-preencher campos de data. */
function hoje() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function CampoCustoAquisicao({
  veiculoId,
  valorCentavos,
}: {
  veiculoId: string;
  valorCentavos: number | null;
}) {
  return (
    <form action={salvarCustoAquisicao} className="flex items-end gap-2">
      <input type="hidden" name="veiculoId" value={veiculoId} />
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-text-muted">
          Custo de aquisição
        </span>
        <Campo
          name="custo"
          inputMode="decimal"
          placeholder="0,00"
          defaultValue={
            valorCentavos === null ? "" : (valorCentavos / 100).toFixed(2).replace(".", ",")
          }
          className="h-9 w-36 text-[13px]"
        />
      </label>
      <button
        type="submit"
        title="Salvar custo"
        className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-line text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
      >
        <Save size={15} />
      </button>
    </form>
  );
}

export function FormularioDespesa({ veiculoId }: { veiculoId: string }) {
  const [estado, acao, enviando] = useActionState(lancarDespesa, ESTADO_SIMPLES);
  const form = useRef<HTMLFormElement>(null);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (estado.ok) form.current?.reset();
  }, [estado.ok]);

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-line px-2.5 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
      >
        <Receipt size={13} /> Lançar gasto
      </button>
    );
  }

  return (
    <form
      ref={form}
      action={acao}
      className="w-full rounded-[var(--radius-sm)] border border-line bg-surface-2 p-3"
    >
      <input type="hidden" name="veiculoId" value={veiculoId} />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <GrupoCampo rotulo="Descrição" erro={estado.erros?.descricao}>
          <Campo
            name="descricao"
            placeholder="Ex.: transferência"
            required
            className="h-9 text-[13px]"
          />
        </GrupoCampo>
        <GrupoCampo rotulo="Categoria">
          <Selecao name="categoria" defaultValue="OUTROS" className="h-9 text-[13px]">
            {opcoes(CATEGORIA_DESPESA).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Selecao>
        </GrupoCampo>
        <GrupoCampo rotulo="Valor (R$)" erro={estado.erros?.valor}>
          <Campo
            name="valor"
            inputMode="decimal"
            placeholder="0,00"
            required
            className="h-9 text-[13px]"
          />
        </GrupoCampo>
        <GrupoCampo rotulo="Data">
          <Campo
            name="data"
            type="date"
            defaultValue={hoje()}
            className="h-9 text-[13px]"
          />
        </GrupoCampo>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Botao type="submit" tamanho="sm" disabled={enviando}>
          {enviando ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <>
              <Plus size={14} /> Lançar
            </>
          )}
        </Botao>
        <Botao
          type="button"
          tamanho="sm"
          variante="contorno"
          onClick={() => setAberto(false)}
        >
          Fechar
        </Botao>
        <Mensagem estado={estado} />
      </div>
    </form>
  );
}

export function BotaoExcluirDespesa({
  id,
  descricao,
  valorCentavos,
}: {
  id: string;
  descricao: string;
  valorCentavos: number;
}) {
  return (
    <form
      action={excluirDespesa}
      onSubmit={(e) => {
        if (
          !confirm(
            `Excluir o gasto "${descricao}" de ${moedaExata(valorCentavos)}?`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        title="Excluir gasto"
        className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-text-muted transition-colors hover:bg-danger/10 hover:text-danger"
      >
        <Trash2 size={13} />
      </button>
    </form>
  );
}

export function FormularioVenda({
  veiculoId,
  precoAnunciadoCentavos,
  leads,
  vendedores,
}: {
  veiculoId: string;
  precoAnunciadoCentavos: number;
  leads: Array<{ id: string; nome: string }>;
  vendedores: Array<{ id: string; nome: string }>;
}) {
  const [estado, acao, enviando] = useActionState(registrarVenda, ESTADO_SIMPLES);
  const [aberto, setAberto] = useState(false);

  if (!aberto) {
    return (
      <Botao type="button" tamanho="sm" onClick={() => setAberto(true)}>
        Registrar venda
      </Botao>
    );
  }

  return (
    <form
      action={acao}
      className="w-full rounded-[var(--radius-sm)] border border-line bg-surface-2 p-3"
    >
      <input type="hidden" name="veiculoId" value={veiculoId} />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <GrupoCampo
          rotulo="Valor da venda (R$)"
          erro={estado.erros?.valor}
          ajuda="Vem do anunciado; ajuste se houve negociação."
        >
          <Campo
            name="valor"
            inputMode="decimal"
            required
            defaultValue={(precoAnunciadoCentavos / 100)
              .toFixed(2)
              .replace(".", ",")}
            className="h-9 text-[13px]"
          />
        </GrupoCampo>

        <GrupoCampo rotulo="Comissão (R$)" erro={estado.erros?.comissao}>
          <Campo
            name="comissao"
            inputMode="decimal"
            defaultValue="0,00"
            className="h-9 text-[13px]"
          />
        </GrupoCampo>

        <GrupoCampo rotulo="Data da venda">
          <Campo
            name="vendidoEm"
            type="date"
            defaultValue={hoje()}
            className="h-9 text-[13px]"
          />
        </GrupoCampo>

        <GrupoCampo rotulo="Comprador" erro={estado.erros?.compradorNome}>
          <Campo name="compradorNome" required className="h-9 text-[13px]" />
        </GrupoCampo>

        <GrupoCampo rotulo="Telefone">
          <Campo name="compradorTelefone" className="h-9 text-[13px]" />
        </GrupoCampo>

        <GrupoCampo rotulo="Forma de pagamento">
          <Campo
            name="formaPagamento"
            placeholder="Ex.: financiamento"
            className="h-9 text-[13px]"
          />
        </GrupoCampo>

        <GrupoCampo rotulo="Vendedor">
          <Selecao name="vendedorId" defaultValue="" className="h-9 text-[13px]">
            <option value="">Eu mesmo</option>
            {vendedores.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nome}
              </option>
            ))}
          </Selecao>
        </GrupoCampo>

        <GrupoCampo
          rotulo="Lead de origem"
          ajuda="Ao vincular, o lead vira CONVERTIDO."
        >
          <Selecao name="leadId" defaultValue="" className="h-9 text-[13px]">
            <option value="">Sem lead</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome}
              </option>
            ))}
          </Selecao>
        </GrupoCampo>
      </div>

      <div className="mt-2">
        <GrupoCampo rotulo="Observações">
          <AreaTexto name="observacoes" rows={2} className="text-[13px]" />
        </GrupoCampo>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Botao type="submit" tamanho="sm" disabled={enviando}>
          {enviando ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            "Confirmar venda"
          )}
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
      </div>
    </form>
  );
}
