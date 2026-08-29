"use client";

import { useActionState, useMemo, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { enviarFinanciamento } from "@/acoes/leads";
import { ESTADO_INICIAL } from "@/lib/estados-formulario";
import { AreaTexto, Botao, Campo, GrupoCampo, Selecao } from "@/components/ui";
import { moeda, paraCentavos, telefoneMascara } from "@/lib/format";

/** Taxa média mensal usada apenas na estimativa exibida na tela. */
const TAXA_MENSAL = 0.0179;
const PARCELAS = [12, 24, 36, 48, 60];

function mascaraCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function mascaraMoeda(v: string) {
  const d = v.replace(/\D/g, "");
  if (!d) return "";
  return (Number(d) / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function FormularioFinanciamento({
  veiculos,
  veiculoSelecionado,
}: {
  veiculos: Array<{
    id: string;
    slug: string;
    titulo: string;
    precoCentavos: number;
  }>;
  veiculoSelecionado?: string;
}) {
  const [estado, acao, enviando] = useActionState(
    enviarFinanciamento,
    ESTADO_INICIAL,
  );

  const inicial =
    veiculos.find((v) => v.slug === veiculoSelecionado)?.id ?? veiculos[0]?.id ?? "";

  const [veiculoId, setVeiculoId] = useState(inicial);
  const [entrada, setEntrada] = useState("");
  const [parcelas, setParcelas] = useState(48);
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");

  const veiculo = veiculos.find((v) => v.id === veiculoId);

  const estimativa = useMemo(() => {
    if (!veiculo) return null;
    const entradaCentavos = paraCentavos(entrada) ?? 0;
    const financiado = veiculo.precoCentavos - entradaCentavos;
    if (financiado <= 0) return { financiado: 0, parcela: 0, total: 0 };

    const i = TAXA_MENSAL;
    const n = parcelas;
    const parcela = (financiado * i) / (1 - Math.pow(1 + i, -n));
    return {
      financiado,
      parcela: Math.round(parcela),
      total: Math.round(parcela * n) + entradaCentavos,
    };
  }, [veiculo, entrada, parcelas]);

  if (estado.ok) {
    return (
      <div className="rounded-[var(--radius)] border border-success/25 bg-success/8 p-8 text-center">
        <CheckCircle2 size={40} className="mx-auto mb-3 text-success" />
        <p className="text-base font-bold text-text">{estado.mensagem}</p>
        <p className="mt-1.5 text-sm text-text-muted">
          Um consultor vai retornar com as condições aprovadas.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <form action={acao} className="space-y-4">
        <input type="hidden" name="veiculoId" value={veiculoId} />
        <input type="hidden" name="parcelas" value={parcelas} />
        <input type="hidden" name="entrada" value={entrada} />

        {veiculos.length > 0 && (
          <GrupoCampo rotulo="Veículo de interesse" htmlFor="fin-veiculo">
            <Selecao
              id="fin-veiculo"
              value={veiculoId}
              onChange={(e) => setVeiculoId(e.target.value)}
            >
              {veiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.titulo} — {moeda(v.precoCentavos)}
                </option>
              ))}
            </Selecao>
          </GrupoCampo>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <GrupoCampo
            rotulo="Valor de entrada (R$)"
            htmlFor="fin-entrada"
            ajuda="Quanto maior a entrada, menor a parcela."
          >
            <Campo
              id="fin-entrada"
              inputMode="numeric"
              placeholder="0,00"
              value={entrada}
              onChange={(e) => setEntrada(mascaraMoeda(e.target.value))}
            />
          </GrupoCampo>

          <GrupoCampo rotulo="Número de parcelas" htmlFor="fin-parcelas">
            <Selecao
              id="fin-parcelas"
              value={parcelas}
              onChange={(e) => setParcelas(Number(e.target.value))}
            >
              {PARCELAS.map((p) => (
                <option key={p} value={p}>
                  {p}x
                </option>
              ))}
            </Selecao>
          </GrupoCampo>
        </div>

        <div className="border-t border-line pt-4">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Seus dados
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <GrupoCampo
              rotulo="Nome completo"
              obrigatorio
              htmlFor="fin-nome"
              erro={estado.erros?.nome}
            >
              <Campo id="fin-nome" name="nome" required />
            </GrupoCampo>

            <GrupoCampo
              rotulo="Data de nascimento"
              obrigatorio
              htmlFor="fin-nasc"
              erro={estado.erros?.dataNascimento}
            >
              <Campo id="fin-nasc" name="dataNascimento" type="date" required />
            </GrupoCampo>

            <GrupoCampo
              rotulo="E-mail"
              obrigatorio
              htmlFor="fin-email"
              erro={estado.erros?.email}
            >
              <Campo id="fin-email" name="email" type="email" required />
            </GrupoCampo>

            <GrupoCampo
              rotulo="CPF"
              obrigatorio
              htmlFor="fin-cpf"
              erro={estado.erros?.cpf}
            >
              <Campo
                id="fin-cpf"
                name="cpf"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(mascaraCpf(e.target.value))}
                required
              />
            </GrupoCampo>

            <GrupoCampo
              rotulo="Telefone"
              obrigatorio
              htmlFor="fin-tel"
              erro={estado.erros?.telefone}
              className="sm:col-span-2"
            >
              <Campo
                id="fin-tel"
                name="telefone"
                inputMode="tel"
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={(e) => setTelefone(telefoneMascara(e.target.value))}
                required
              />
            </GrupoCampo>

            <GrupoCampo
              rotulo="Observações"
              htmlFor="fin-msg"
              className="sm:col-span-2"
            >
              <AreaTexto
                id="fin-msg"
                name="mensagem"
                rows={3}
                placeholder="Conte para a gente qualquer detalhe que ajude na análise."
              />
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
            Autorizo o contato por e-mail, telefone e WhatsApp sobre esta simulação.
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
            "Solicitar simulação"
          )}
        </Botao>
      </form>

      {/* resumo */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-[var(--radius)] bg-ink p-6 text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
            Estimativa
          </p>

          {veiculo ? (
            <>
              <p className="mt-3 text-sm text-white/70">{veiculo.titulo}</p>
              <p className="mt-1 font-display text-2xl font-black">
                {moeda(veiculo.precoCentavos)}
              </p>

              <dl className="mt-5 space-y-3 border-t border-white/10 pt-5 text-sm">
                <Linha
                  rotulo="Entrada"
                  valor={moeda(paraCentavos(entrada) ?? 0)}
                />
                <Linha
                  rotulo="Valor financiado"
                  valor={moeda(estimativa?.financiado ?? 0)}
                />
                <Linha rotulo="Parcelas" valor={`${parcelas}x`} />
              </dl>

              <div className="mt-5 rounded-[var(--radius-sm)] bg-white/6 p-4">
                <p className="text-[11px] uppercase tracking-wide text-white/50">
                  Parcela estimada
                </p>
                <p className="mt-1 font-display text-3xl font-black text-brand">
                  {moeda(estimativa?.parcela ?? 0)}
                </p>
              </div>

              <p className="mt-4 text-[11px] leading-relaxed text-white/40">
                Cálculo ilustrativo com taxa de {(TAXA_MENSAL * 100).toFixed(2)}% a.m.,
                sem IOF e tarifas. As condições reais dependem da análise de crédito.
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-white/60">
              Cadastre veículos no estoque para simular o financiamento.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-white/55">{rotulo}</dt>
      <dd className="font-semibold text-white">{valor}</dd>
    </div>
  );
}
