import type { Metadata } from "next";
import { CircleCheck, Clock3, FileText, ShieldCheck } from "lucide-react";
import { CabecalhoPagina } from "@/components/site/cabecalho-pagina";
import { FormularioFinanciamento } from "@/components/site/formulario-financiamento";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Simular financiamento",
  description:
    "Simule o financiamento do seu próximo carro, escolha a entrada e o número de parcelas.",
};

const PASSOS = [
  {
    icone: FileText,
    titulo: "1. Preencha a simulação",
    texto: "Escolha o veículo, a entrada e o prazo que fazem sentido para você.",
  },
  {
    icone: Clock3,
    titulo: "2. Análise rápida",
    texto: "Enviamos sua proposta às instituições parceiras e retornamos em pouco tempo.",
  },
  {
    icone: CircleCheck,
    titulo: "3. Aprovação e entrega",
    texto: "Com o crédito aprovado, é só assinar e retirar o carro na loja.",
  },
];

export default async function PaginaFinanciamento(
  props: PageProps<"/financiamento">,
) {
  const params = await props.searchParams;
  const slugSelecionado = Array.isArray(params.veiculo)
    ? params.veiculo[0]
    : params.veiculo;

  const veiculos = await prisma.veiculo.findMany({
    where: { status: "DISPONIVEL" },
    orderBy: [{ destaque: "desc" }, { precoCentavos: "asc" }],
    select: {
      id: true,
      slug: true,
      precoCentavos: true,
      anoModelo: true,
      versao: true,
      marca: { select: { nome: true } },
      modelo: { select: { nome: true } },
    },
  });

  return (
    <>
      <CabecalhoPagina
        titulo="SIMULE SEU FINANCIAMENTO"
        descricao="Monte a proposta do seu jeito: escolha o veículo, o valor de entrada e o número de parcelas. A simulação é gratuita e sem compromisso."
        migalhas={[{ label: "Financiamento" }]}
      />

      <div className="container-page py-10">
        <div className="mb-10 grid gap-5 md:grid-cols-3">
          {PASSOS.map((p) => (
            <div
              key={p.titulo}
              className="rounded-[var(--radius)] border border-line bg-surface p-5"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand">
                <p.icone size={19} />
              </span>
              <h2 className="mt-3.5 text-sm font-bold text-text">{p.titulo}</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-text-muted">
                {p.texto}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-[var(--radius)] border border-line bg-surface p-6 md:p-8">
          <FormularioFinanciamento
            veiculoSelecionado={slugSelecionado}
            veiculos={veiculos.map((v) => ({
              id: v.id,
              slug: v.slug,
              precoCentavos: v.precoCentavos,
              titulo: `${v.marca.nome} ${v.modelo.nome} ${v.anoModelo}`,
            }))}
          />
        </div>

        <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-text-muted">
          <ShieldCheck size={15} className="mt-0.5 shrink-0 text-brand" />
          Seus dados são usados exclusivamente para a análise de crédito e para o
          contato da nossa equipe. Não compartilhamos suas informações com terceiros
          sem a sua autorização.
        </p>
      </div>
    </>
  );
}
