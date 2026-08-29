import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Calendar,
  Car,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Droplets,
  Flag,
  Fuel,
  Gauge,
  MapPin,
  Palette,
  Settings2,
  Shield,
  ShieldCheck,
  Store,
} from "lucide-react";
import { GaleriaVeiculo } from "@/components/site/galeria-veiculo";
import { FormularioLead } from "@/components/site/formulario-lead";
import { VeiculoCard } from "@/components/veiculo-card";
import { IconeWhatsapp } from "@/components/icones-sociais";
import { BotaoLink, Selo } from "@/components/ui";
import {
  registrarVisita,
  veiculoPorSlug,
  veiculosSimilares,
} from "@/lib/veiculos";
import { linkWhatsapp, obterConfiguracao } from "@/lib/configuracao";
import { CAMBIO, CARROCERIA, COMBUSTIVEL, CONDICAO } from "@/lib/labels";
import { km, moeda, numero, variacaoFipe } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/veiculo/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const veiculo = await veiculoPorSlug(slug);
  if (!veiculo) return { title: "Veículo não encontrado" };

  const titulo = `${veiculo.marca.nome} ${veiculo.modelo.nome} ${veiculo.anoFabricacao}/${veiculo.anoModelo}`;
  return {
    title: titulo,
    description: `${titulo} — ${veiculo.versao}. ${km(veiculo.quilometragem)} por ${moeda(veiculo.precoCentavos)}.`,
    openGraph: {
      title: titulo,
      images: veiculo.imagens[0]?.url ? [veiculo.imagens[0].url] : undefined,
    },
  };
}

export default async function PaginaVeiculo(
  props: PageProps<"/veiculo/[slug]">,
) {
  const { slug } = await props.params;
  const veiculo = await veiculoPorSlug(slug);
  if (!veiculo) notFound();

  const [similares, config] = await Promise.all([
    veiculosSimilares(veiculo, 5),
    obterConfiguracao(),
  ]);
  await registrarVisita(veiculo.id);

  const titulo = `${veiculo.marca.nome} ${veiculo.modelo.nome}`;
  const diferencaFipe = variacaoFipe(
    veiculo.precoCentavos,
    veiculo.precoFipeCentavos,
  );

  const whatsapp = linkWhatsapp(
    config.whatsapp,
    `Olá! Tenho interesse no ${titulo} ${veiculo.anoFabricacao}/${veiculo.anoModelo} anunciado por ${moeda(veiculo.precoCentavos)}.`,
  );

  const ficha = [
    { icone: Calendar, rotulo: "Ano", valor: `${veiculo.anoFabricacao}/${veiculo.anoModelo}` },
    { icone: Gauge, rotulo: "KM", valor: numero(veiculo.quilometragem) },
    { icone: Settings2, rotulo: "Câmbio", valor: CAMBIO[veiculo.cambio] },
    { icone: Car, rotulo: "Carroceria", valor: CARROCERIA[veiculo.carroceria] },
    { icone: Fuel, rotulo: "Combustível", valor: COMBUSTIVEL[veiculo.combustivel] },
    { icone: Flag, rotulo: "Final de placa", valor: veiculo.finalPlaca || "—" },
    { icone: Palette, rotulo: "Cor", valor: veiculo.cor },
    { icone: Shield, rotulo: "Blindado", valor: veiculo.blindado ? "Sim" : "Não" },
    { icone: Droplets, rotulo: "Portas", valor: String(veiculo.portas) },
    { icone: BadgeCheck, rotulo: "Aceita troca", valor: veiculo.aceitaTroca ? "Sim" : "Não" },
  ];

  const categorias = agruparOpcionais(veiculo.opcionais);

  return (
    <div className="bg-surface-2">
      <div className="container-page py-6">
        <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-text-muted">
          <Link href="/" className="hover:text-brand">Início</Link>
          <span>/</span>
          <Link href="/estoque" className="hover:text-brand">Estoque</Link>
          <span>/</span>
          <Link href={`/estoque?marca=${veiculo.marca.slug}`} className="hover:text-brand">
            {veiculo.marca.nome}
          </Link>
          <span>/</span>
          <span className="text-text">{veiculo.modelo.nome}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* ------------------------------------------------ coluna principal */}
          <div className="space-y-5">
            <GaleriaVeiculo
              imagens={veiculo.imagens.map((i) => ({
                id: i.id,
                url: i.url,
                alt: i.alt,
              }))}
              titulo={titulo}
            />

            <Cartao>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="font-display text-3xl font-black tracking-tight text-text">
                    {veiculo.marca.nome}{" "}
                    <span className="text-brand">{veiculo.modelo.nome}</span>
                  </h1>
                  <p className="mt-1 text-sm uppercase tracking-wide text-text-muted">
                    {veiculo.versao}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Selo tom="suave">{CONDICAO[veiculo.condicao]}</Selo>
                  {veiculo.blindado && (
                    <Selo tom="escuro">
                      <ShieldCheck size={12} /> Blindado
                    </Selo>
                  )}
                  {veiculo.unicoDono && <Selo tom="info">Único dono</Selo>}
                  {veiculo.status === "RESERVADO" && (
                    <Selo tom="aviso">Reservado</Selo>
                  )}
                  {veiculo.status === "VENDIDO" && <Selo tom="perigo">Vendido</Selo>}
                </div>
              </div>

              {veiculo.cidade && (
                <p className="mt-4 flex items-center gap-1.5 text-sm text-text-muted">
                  <MapPin size={15} className="text-brand" />
                  {veiculo.cidade} - {veiculo.estado}
                </p>
              )}

              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-3 lg:grid-cols-4">
                {ficha.map((f) => (
                  <div key={f.rotulo}>
                    <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-text-muted">
                      <f.icone size={13} className="text-text-muted/70" />
                      {f.rotulo}
                    </dt>
                    <dd className="mt-1 text-[15px] font-bold text-text">{f.valor}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5">
                {veiculo.ipvaPago && <Marcador>IPVA pago</Marcador>}
                {veiculo.licenciado && <Marcador>Licenciado</Marcador>}
                {veiculo.revisoesEmDia && <Marcador>Revisões em dia</Marcador>}
                {veiculo.garantiaFabrica && <Marcador>Garantia de fábrica</Marcador>}
                {veiculo.aceitaTroca && <Marcador>Aceita troca</Marcador>}
              </div>
            </Cartao>

            {veiculo.descricao && (
              <Cartao>
                <TituloBloco>Sobre este carro</TituloBloco>
                <p className="whitespace-pre-line text-sm leading-relaxed text-text">
                  {veiculo.descricao}
                </p>
              </Cartao>
            )}

            {categorias.length > 0 && (
              <Cartao>
                <TituloBloco>Itens do veículo</TituloBloco>
                <div className="space-y-6">
                  {categorias.map(([categoria, itens]) => (
                    <div key={categoria}>
                      <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                        {categoria}
                      </p>
                      <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        {itens.map((nome) => (
                          <li
                            key={nome}
                            className="flex items-start gap-2 text-sm text-text"
                          >
                            <CheckCircle2
                              size={15}
                              className="mt-0.5 shrink-0 text-brand"
                            />
                            {nome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Cartao>
            )}

            {/* comparativo de preços */}
            {(veiculo.precoFipeCentavos || veiculo.precoMedioCentavos) && (
              <div className="rounded-[var(--radius)] bg-ink p-6 text-white md:p-8">
                <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
                  Compare os preços
                </p>
                <div className="grid gap-6 sm:grid-cols-3">
                  <ValorComparado
                    rotulo="Valor anunciado"
                    valor={moeda(veiculo.precoCentavos)}
                    destaque
                  />
                  {veiculo.precoMedioCentavos && (
                    <ValorComparado
                      rotulo="Média de mercado"
                      valor={moeda(veiculo.precoMedioCentavos)}
                      nota="Média de veículos iguais a este"
                    />
                  )}
                  {veiculo.precoFipeCentavos && (
                    <ValorComparado
                      rotulo="Tabela FIPE"
                      valor={moeda(veiculo.precoFipeCentavos)}
                      nota="Valor de referência FIPE"
                    />
                  )}
                </div>
                {diferencaFipe !== null && (
                  <p className="mt-6 border-t border-white/10 pt-4 text-xs text-white/60">
                    {Math.abs(diferencaFipe) < 0.5 ? (
                      <>
                        Este anúncio está{" "}
                        <strong className="text-success">
                          alinhado com a tabela FIPE
                        </strong>
                        .
                      </>
                    ) : (
                      <>
                        Este anúncio está{" "}
                        <strong
                          className={
                            diferencaFipe < 0 ? "text-success" : "text-warning"
                          }
                        >
                          {Math.abs(diferencaFipe).toFixed(1)}%{" "}
                          {diferencaFipe < 0 ? "abaixo" : "acima"}
                        </strong>{" "}
                        da tabela FIPE.
                      </>
                    )}
                  </p>
                )}
              </div>
            )}

            {/* vendedor */}
            <Cartao>
              <TituloBloco>Sobre a loja</TituloBloco>
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="flex gap-4">
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius)] bg-surface-2 text-text-muted">
                    <Store size={24} />
                  </span>
                  <div>
                    <p className="text-lg font-bold text-text">{config.nomeLoja}</p>
                    {config.cidade && (
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-text-muted">
                        <MapPin size={13} /> {config.cidade}, {config.estado}
                      </p>
                    )}
                    {config.telefone && (
                      <p className="mt-2 text-sm font-semibold text-text">
                        {config.telefone}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-6 text-center">
                  <div>
                    <Clock size={18} className="mx-auto text-brand" />
                    <p className="mt-1.5 text-[11px] leading-tight text-text-muted">
                      Vendas
                      <br />
                      <strong className="text-text">{config.horarioVendas}</strong>
                    </p>
                  </div>
                  <div>
                    <BadgeCheck size={18} className="mx-auto text-brand" />
                    <p className="mt-1.5 text-[11px] leading-tight text-text-muted">
                      Veículo com
                      <br />
                      <strong className="text-text">laudo cautelar</strong>
                    </p>
                  </div>
                </div>
              </div>
            </Cartao>
          </div>

          {/* ---------------------------------------------------- barra lateral */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="space-y-4">
              <Cartao>
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    {veiculo.precoDeCentavos &&
                    veiculo.precoDeCentavos > veiculo.precoCentavos ? (
                      <p className="text-sm text-text-muted line-through">
                        {moeda(veiculo.precoDeCentavos)}
                      </p>
                    ) : null}
                    <p className="font-display text-[32px] font-black leading-none tracking-tight text-text">
                      {moeda(veiculo.precoCentavos)}
                    </p>
                  </div>
                </div>

                <BotaoLink
                  href={`/financiamento?veiculo=${veiculo.slug}`}
                  variante="escuro"
                  className="mt-4 w-full"
                >
                  <CircleDollarSign size={16} />
                  Ver parcelas
                </BotaoLink>

                {whatsapp && (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[#25D366] text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <IconeWhatsapp size={17} />
                    Falar no WhatsApp
                  </a>
                )}

                <div className="mt-5 border-t border-line pt-5">
                  <p className="mb-3 text-sm font-semibold text-text">
                    Envie uma mensagem à loja
                  </p>
                  <FormularioLead
                    veiculoId={veiculo.id}
                    compacto
                    mensagemPadrao={`Olá, tenho interesse no ${titulo} ${veiculo.anoFabricacao}/${veiculo.anoModelo}. Por favor entre em contato.`}
                  />
                </div>
              </Cartao>

              <Cartao className="text-center">
                <p className="text-sm font-semibold text-text">
                  Quer usar seu carro como entrada?
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  Avaliamos seu usado e abatemos no valor deste veículo.
                </p>
                <BotaoLink
                  href="/avaliar-troca"
                  variante="contorno"
                  className="mt-4 w-full"
                >
                  Avaliar meu carro
                </BotaoLink>
              </Cartao>
            </div>
          </aside>
        </div>

        {/* ------------------------------------------------------- similares */}
        {similares.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-5 text-xl font-extrabold tracking-tight text-text">
              Você também pode gostar
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {similares.slice(0, 4).map((v) => (
                <VeiculoCard key={v.id} veiculo={v} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- auxiliares */

function Cartao({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-[var(--radius)] border border-line bg-surface p-5 md:p-6 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

function TituloBloco({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">
      {children}
    </h2>
  );
}

function Marcador({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-medium text-text">
      <CheckCircle2 size={13} className="text-success" />
      {children}
    </span>
  );
}

function ValorComparado({
  rotulo,
  valor,
  nota,
  destaque = false,
}: {
  rotulo: string;
  valor: string;
  nota?: string;
  destaque?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-white/50">{rotulo}</p>
      <p
        className={
          destaque
            ? "mt-1.5 font-display text-2xl font-black tracking-tight text-white md:text-[28px]"
            : "mt-1.5 font-display text-2xl font-black tracking-tight text-white/85 md:text-[28px]"
        }
      >
        {valor}
      </p>
      {nota && <p className="mt-1 text-[11px] leading-snug text-white/40">{nota}</p>}
    </div>
  );
}

function agruparOpcionais(
  opcionais: Array<{ opcional: { nome: string; categoria: string } }>,
): Array<[string, string[]]> {
  const ordem = ["Seguranca", "Conforto", "Tecnologia", "Externo"];
  const rotulos: Record<string, string> = {
    Seguranca: "Segurança",
    Conforto: "Conforto",
    Tecnologia: "Tecnologia e multimídia",
    Externo: "Externo",
  };

  const mapa = new Map<string, string[]>();
  for (const { opcional } of opcionais) {
    const lista = mapa.get(opcional.categoria) ?? [];
    lista.push(opcional.nome);
    mapa.set(opcional.categoria, lista);
  }

  return [...mapa.entries()]
    .sort((a, b) => ordem.indexOf(a[0]) - ordem.indexOf(b[0]))
    .map(([categoria, itens]) => [
      rotulos[categoria] ?? categoria,
      itens.sort((a, b) => a.localeCompare(b, "pt-BR")),
    ]);
}
