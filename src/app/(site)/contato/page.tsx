import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { CabecalhoPagina } from "@/components/site/cabecalho-pagina";
import { FormularioLead } from "@/components/site/formulario-lead";
import { IconeWhatsapp } from "@/components/icones-sociais";
import { linkWhatsapp, obterConfiguracao } from "@/lib/configuracao";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a nossa equipe por telefone, e-mail ou WhatsApp.",
};

export default async function PaginaContato() {
  const c = await obterConfiguracao();
  const whatsapp = linkWhatsapp(
    c.whatsapp,
    `Olá! Vim pelo site da ${c.nomeLoja} e gostaria de falar com um consultor.`,
  );

  return (
    <>
      <CabecalhoPagina
        titulo="FALE COM A GENTE"
        descricao="Tire dúvidas sobre um veículo, agende uma visita ou peça ajuda de um consultor."
        migalhas={[{ label: "Contato" }]}
      />

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-4">
          {c.telefone && (
            <BlocoContato icone={Phone} titulo="Telefone">
              <a
                href={`tel:${c.telefone.replace(/\D/g, "")}`}
                className="text-[15px] font-bold text-text hover:text-brand"
              >
                {c.telefone}
              </a>
            </BlocoContato>
          )}

          {whatsapp && (
            <BlocoContato icone={IconeWhatsapp} titulo="WhatsApp">
              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="text-[15px] font-bold text-text hover:text-brand"
              >
                {c.whatsapp}
              </a>
              <p className="mt-1 text-xs text-text-muted">
                Atendimento rápido em horário comercial.
              </p>
            </BlocoContato>
          )}

          {c.email && (
            <BlocoContato icone={Mail} titulo="E-mail">
              <a
                href={`mailto:${c.email}`}
                className="break-all text-[15px] font-bold text-text hover:text-brand"
              >
                {c.email}
              </a>
            </BlocoContato>
          )}

          {c.endereco && (
            <BlocoContato icone={MapPin} titulo="Endereço">
              <p className="text-[15px] font-bold text-text">{c.endereco}</p>
              <p className="mt-0.5 text-sm text-text-muted">
                {c.cidade} - {c.estado}
                {c.cep && ` · ${c.cep}`}
              </p>
            </BlocoContato>
          )}

          <BlocoContato icone={Clock} titulo="Horário de atendimento">
            <p className="text-sm text-text">
              <strong className="font-semibold">Vendas:</strong> {c.horarioVendas}
            </p>
            <p className="mt-1 text-sm text-text">
              <strong className="font-semibold">Oficina:</strong> {c.horarioServico}
            </p>
          </BlocoContato>
        </div>

        <div className="rounded-[var(--radius)] border border-line bg-surface p-6 md:p-8">
          <h2 className="mb-1 text-xl font-extrabold text-text">
            Envie uma mensagem
          </h2>
          <p className="mb-6 text-sm text-text-muted">
            Preencha o formulário e um consultor entra em contato.
          </p>
          <FormularioLead
            origem="CONTATO"
            mensagemPadrao=""
          />
        </div>
      </div>

      {c.mapaUrl && (
        <div className="h-[380px] w-full border-t border-line">
          <iframe
            src={c.mapaUrl}
            title="Localização da loja"
            className="h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </>
  );
}

function BlocoContato({
  icone: Icone,
  titulo,
  children,
}: {
  icone: React.ComponentType<{ size?: number; className?: string }>;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-[var(--radius)] border border-line bg-surface p-5">
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Icone size={18} />
      </span>
      <div className="min-w-0">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-text-muted">
          {titulo}
        </p>
        {children}
      </div>
    </div>
  );
}
