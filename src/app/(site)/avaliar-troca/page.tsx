import type { Metadata } from "next";
import { Camera, HandCoins, KeyRound, Search } from "lucide-react";
import { CabecalhoPagina } from "@/components/site/cabecalho-pagina";
import { FormularioTroca } from "@/components/site/formulario-troca";

export const metadata: Metadata = {
  title: "Avaliar meu carro",
  description:
    "Descubra quanto vale o seu carro e use o valor como entrada em um veículo do nosso estoque.",
};

const ETAPAS = [
  {
    icone: Search,
    titulo: "Você envia os dados",
    texto: "Placa, modelo, ano e quilometragem — leva menos de um minuto.",
  },
  {
    icone: Camera,
    titulo: "Avaliamos o veículo",
    texto: "Analisamos histórico, estado de conservação e a demanda de mercado.",
  },
  {
    icone: HandCoins,
    titulo: "Você recebe a proposta",
    texto: "Uma oferta justa, válida para venda direta ou como entrada na troca.",
  },
];

export default function PaginaAvaliarTroca() {
  return (
    <>
      <CabecalhoPagina
        titulo="QUANTO VALE O SEU CARRO?"
        descricao="Receba uma proposta de mercado para o seu veículo e use o valor como entrada em qualquer carro do nosso estoque."
        migalhas={[{ label: "Avaliar meu carro" }]}
      />

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-[var(--radius)] border border-line bg-surface p-6 md:p-8">
          <FormularioTroca />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[var(--radius)] bg-ink p-6 text-white">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand/15 text-brand">
              <KeyRound size={21} />
            </span>
            <h2 className="mt-4 font-display text-xl font-black">
              COMO FUNCIONA
            </h2>
            <ol className="mt-5 space-y-5">
              {ETAPAS.map((e, i) => (
                <li key={e.titulo} className="flex gap-3.5">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{e.titulo}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-white/60">
                      {e.texto}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-[var(--radius)] border border-line bg-surface p-5">
            <p className="text-sm font-semibold text-text">
              Avaliação sem compromisso
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-text-muted">
              Você não paga nada para avaliar e não fica obrigado a vender. Se a
              proposta fizer sentido, seguimos; se não, tudo bem.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
