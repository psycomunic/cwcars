"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Car,
  ChevronDown,
  Mail,
  MessageSquare,
  Phone,
  Trash2,
} from "lucide-react";
import { atualizarLead, excluirLead } from "@/acoes/admin";
import { AreaTexto, Botao, Selecao, Selo } from "@/components/ui";
import { IconeWhatsapp } from "@/components/icones-sociais";
import { ORIGEM_LEAD, STATUS_LEAD, opcoes } from "@/lib/labels";
import { dataHora, km, moeda, telefoneParaWhatsapp } from "@/lib/format";
import { cn } from "@/lib/utils";

export type LeadDoPainel = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
  origem: keyof typeof ORIGEM_LEAD;
  status: keyof typeof STATUS_LEAD;
  observacoes: string;
  criadoEm: string;
  aceitaContato: boolean;
  cpf: string | null;
  entradaCentavos: number | null;
  parcelas: number | null;
  trocaPlaca: string | null;
  trocaMarca: string | null;
  trocaModelo: string | null;
  trocaAno: number | null;
  trocaKm: number | null;
  veiculo: { slug: string; titulo: string } | null;
};

const TONS: Record<string, "marca" | "info" | "aviso" | "sucesso" | "neutro"> = {
  NOVO: "marca",
  EM_ATENDIMENTO: "info",
  NEGOCIANDO: "aviso",
  CONVERTIDO: "sucesso",
  PERDIDO: "neutro",
};

export function CartaoLead({ lead }: { lead: LeadDoPainel }) {
  const [aberto, setAberto] = useState(false);
  const whatsapp = telefoneParaWhatsapp(lead.telefone);

  return (
    <article className="overflow-hidden rounded-[var(--radius)] border border-line bg-surface">
      <div className="flex flex-wrap items-start gap-4 p-4">
        <div className="min-w-52 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[15px] font-bold text-text">{lead.nome}</h2>
            <Selo tom={TONS[lead.status]}>{STATUS_LEAD[lead.status]}</Selo>
            {lead.aceitaContato && <Selo tom="suave">Aceita contato</Selo>}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-text-muted">
            <a
              href={`mailto:${lead.email}`}
              className="inline-flex items-center gap-1.5 hover:text-brand"
            >
              <Mail size={13} />
              {lead.email}
            </a>
            <a
              href={`tel:${lead.telefone.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-1.5 hover:text-brand"
            >
              <Phone size={13} />
              {lead.telefone}
            </a>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-[#128C4B] hover:underline"
              >
                <IconeWhatsapp size={13} />
                WhatsApp
              </a>
            )}
          </div>

          <p className="mt-2 text-xs text-text-muted">
            {ORIGEM_LEAD[lead.origem]} · {dataHora(lead.criadoEm)}
          </p>

          {lead.veiculo && (
            <Link
              href={`/veiculo/${lead.veiculo.slug}`}
              target="_blank"
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold text-text hover:text-brand"
            >
              <Car size={13} />
              {lead.veiculo.titulo}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <form action={atualizarLead} className="flex items-center gap-2">
            <input type="hidden" name="id" value={lead.id} />
            <Selecao
              name="status"
              defaultValue={lead.status}
              className="h-10 w-44 text-[13px]"
              aria-label="Status do lead"
            >
              {opcoes(STATUS_LEAD).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Selecao>
            <Botao type="submit" tamanho="sm" variante="contorno">
              Salvar
            </Botao>
          </form>

          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-line text-text-muted transition-colors hover:bg-surface-2"
            title="Detalhes"
          >
            <ChevronDown
              size={17}
              className={cn("transition-transform", aberto && "rotate-180")}
            />
          </button>
        </div>
      </div>

      {aberto && (
        <div className="space-y-4 border-t border-line bg-surface-2 p-4">
          {lead.mensagem && (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                <MessageSquare size={12} />
                Mensagem
              </p>
              <p className="whitespace-pre-line rounded-[var(--radius-sm)] bg-surface p-3 text-sm text-text">
                {lead.mensagem}
              </p>
            </div>
          )}

          {(lead.cpf || lead.parcelas) && (
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Dados da simulação
              </p>
              <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                {lead.cpf && <Item rotulo="CPF" valor={lead.cpf} />}
                {lead.entradaCentavos != null && (
                  <Item rotulo="Entrada" valor={moeda(lead.entradaCentavos)} />
                )}
                {lead.parcelas != null && (
                  <Item rotulo="Parcelas" valor={`${lead.parcelas}x`} />
                )}
              </dl>
            </div>
          )}

          {lead.trocaPlaca && (
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Veículo oferecido na troca
              </p>
              <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                <Item rotulo="Placa" valor={lead.trocaPlaca} />
                <Item
                  rotulo="Veículo"
                  valor={`${lead.trocaMarca ?? ""} ${lead.trocaModelo ?? ""}`.trim()}
                />
                <Item rotulo="Ano" valor={String(lead.trocaAno ?? "—")} />
                <Item rotulo="KM" valor={km(lead.trocaKm)} />
              </dl>
            </div>
          )}

          <form action={atualizarLead} className="space-y-2">
            <input type="hidden" name="id" value={lead.id} />
            <input type="hidden" name="status" value={lead.status} />
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Anotações internas
            </p>
            <AreaTexto
              name="observacoes"
              defaultValue={lead.observacoes}
              rows={3}
              placeholder="Registre o andamento do atendimento."
            />
            <div className="flex justify-between">
              <Botao type="submit" tamanho="sm" variante="contorno">
                Salvar anotações
              </Botao>
            </div>
          </form>

          <form
            action={excluirLead}
            onSubmit={(e) => {
              if (!window.confirm(`Excluir o lead de ${lead.nome}?`)) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="id" value={lead.id} />
            <button
              type="submit"
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-text-muted transition-colors hover:text-danger"
            >
              <Trash2 size={13} />
              Excluir lead
            </button>
          </form>
        </div>
      )}
    </article>
  );
}

function Item({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-text-muted">
        {rotulo}
      </dt>
      <dd className="font-semibold text-text">{valor}</dd>
    </div>
  );
}
