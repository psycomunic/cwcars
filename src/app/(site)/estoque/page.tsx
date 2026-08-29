import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BotaoLink, Vazio } from "@/components/ui";
import { VeiculoCard } from "@/components/veiculo-card";
import { FiltrosEstoque } from "@/components/site/filtros-estoque";
import { OrdenarEstoque } from "@/components/site/ordenar-estoque";
import {
  lerFiltros,
  listarVeiculos,
  opcoesDeFiltro,
  type FiltrosVeiculo,
} from "@/lib/veiculos";
import { CAMBIO, CARROCERIA, COMBUSTIVEL, CONDICAO } from "@/lib/labels";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Estoque de veículos",
  description:
    "Veja todos os carros disponíveis, filtre por marca, modelo, preço, ano e quilometragem.",
};

export default async function PaginaEstoque(props: PageProps<"/estoque">) {
  const params = await props.searchParams;
  const filtros = lerFiltros(params);

  const [resultado, dados] = await Promise.all([
    listarVeiculos({ ...filtros, porPagina: 12 }),
    opcoesDeFiltro(),
  ]);

  const ativos = filtrosAtivos(filtros, dados.marcas, dados.modelos);

  return (
    <>
      <div className="border-b border-line bg-surface-2">
        <div className="container-page py-8">
          <nav className="mb-2 text-xs text-text-muted">
            <Link href="/" className="hover:text-brand">
              Início
            </Link>
            <span className="px-1.5">/</span>
            <span className="text-text">Estoque</span>
          </nav>
          <h1 className="font-display text-3xl font-black tracking-tight text-text md:text-4xl">
            ESTOQUE DISPONÍVEL
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            {resultado.total === 0
              ? "Nenhum veículo encontrado com os filtros atuais."
              : `${resultado.total} ${resultado.total === 1 ? "veículo encontrado" : "veículos encontrados"}.`}
          </p>
        </div>
      </div>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <FiltrosEstoque dados={dados} filtros={filtros} />
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {ativos.map((f) => (
                <Link
                  key={f.chave}
                  href={`/estoque?${removerFiltro(params, f.chave)}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-surface-3 px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-brand-soft hover:text-brand"
                >
                  {f.rotulo}
                  <span aria-hidden>×</span>
                </Link>
              ))}
              {ativos.length > 1 && (
                <Link
                  href="/estoque"
                  className="inline-flex items-center rounded-full px-2 py-1.5 text-xs font-semibold text-brand hover:underline"
                >
                  limpar tudo
                </Link>
              )}
            </div>

            <OrdenarEstoque valor={filtros.ordenar ?? "recentes"} />
          </div>

          {resultado.itens.length === 0 ? (
            <Vazio
              titulo="Nenhum veículo encontrado"
              descricao="Tente ampliar a faixa de preço ou remover alguns filtros."
              acao={
                <BotaoLink href="/estoque" variante="contorno">
                  Limpar filtros
                </BotaoLink>
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {resultado.itens.map((v, i) => (
                <VeiculoCard key={v.id} veiculo={v} prioridade={i < 3} />
              ))}
            </div>
          )}

          {resultado.paginas > 1 && (
            <Paginacao
              pagina={resultado.pagina}
              paginas={resultado.paginas}
              params={params}
            />
          )}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------- auxiliares */

function paraQueryString(
  params: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const busca = new URLSearchParams();
  for (const [chave, valor] of Object.entries(params)) {
    const v = Array.isArray(valor) ? valor[0] : valor;
    if (v) busca.set(chave, v);
  }
  return busca;
}

function removerFiltro(
  params: Record<string, string | string[] | undefined>,
  chave: string,
) {
  const busca = paraQueryString(params);
  busca.delete(chave);
  busca.delete("pagina");
  return busca.toString();
}

function filtrosAtivos(
  f: FiltrosVeiculo,
  marcas: Array<{ nome: string; slug: string }>,
  modelos: Array<{ nome: string; slug: string }>,
) {
  const lista: Array<{ chave: string; rotulo: string }> = [];
  const nomeMarca = marcas.find((m) => m.slug === f.marca)?.nome;
  const nomeModelo = modelos.find((m) => m.slug === f.modelo)?.nome;

  if (f.q) lista.push({ chave: "q", rotulo: `"${f.q}"` });
  if (f.marca) lista.push({ chave: "marca", rotulo: nomeMarca ?? f.marca });
  if (f.modelo) lista.push({ chave: "modelo", rotulo: nomeModelo ?? f.modelo });
  if (f.carroceria)
    lista.push({
      chave: "carroceria",
      rotulo: CARROCERIA[f.carroceria as keyof typeof CARROCERIA] ?? f.carroceria,
    });
  if (f.cambio)
    lista.push({
      chave: "cambio",
      rotulo: CAMBIO[f.cambio as keyof typeof CAMBIO] ?? f.cambio,
    });
  if (f.combustivel)
    lista.push({
      chave: "combustivel",
      rotulo:
        COMBUSTIVEL[f.combustivel as keyof typeof COMBUSTIVEL] ?? f.combustivel,
    });
  if (f.condicao)
    lista.push({
      chave: "condicao",
      rotulo: CONDICAO[f.condicao as keyof typeof CONDICAO] ?? f.condicao,
    });
  if (f.cor) lista.push({ chave: "cor", rotulo: f.cor });
  if (f.precoMin)
    lista.push({
      chave: "precoMin",
      rotulo: `a partir de R$ ${f.precoMin.toLocaleString("pt-BR")}`,
    });
  if (f.precoMax)
    lista.push({
      chave: "precoMax",
      rotulo: `até R$ ${f.precoMax.toLocaleString("pt-BR")}`,
    });
  if (f.anoMin) lista.push({ chave: "anoMin", rotulo: `de ${f.anoMin}` });
  if (f.anoMax) lista.push({ chave: "anoMax", rotulo: `até ${f.anoMax}` });
  if (f.kmMax)
    lista.push({
      chave: "kmMax",
      rotulo: `até ${f.kmMax.toLocaleString("pt-BR")} km`,
    });

  return lista;
}

function Paginacao({
  pagina,
  paginas,
  params,
}: {
  pagina: number;
  paginas: number;
  params: Record<string, string | string[] | undefined>;
}) {
  const href = (n: number) => {
    const busca = paraQueryString(params);
    busca.set("pagina", String(n));
    return `/estoque?${busca.toString()}`;
  };

  const numeros = Array.from({ length: paginas }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === paginas || Math.abs(n - pagina) <= 1,
  );

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5">
      {pagina > 1 && (
        <Link href={href(pagina - 1)} className={estiloPagina(false)} aria-label="Página anterior">
          <ChevronLeft size={16} />
        </Link>
      )}
      {numeros.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5">
          {i > 0 && n - numeros[i - 1] > 1 && (
            <span className="px-1 text-text-muted">…</span>
          )}
          <Link href={href(n)} className={estiloPagina(n === pagina)}>
            {n}
          </Link>
        </span>
      ))}
      {pagina < paginas && (
        <Link href={href(pagina + 1)} className={estiloPagina(false)} aria-label="Próxima página">
          <ChevronRight size={16} />
        </Link>
      )}
    </nav>
  );
}

function estiloPagina(ativo: boolean) {
  return cn(
    "inline-flex h-10 min-w-10 items-center justify-center rounded-[var(--radius-sm)] px-3 text-sm font-semibold transition-colors",
    ativo
      ? "bg-brand text-brand-contrast"
      : "border border-line text-text hover:bg-surface-2",
  );
}
