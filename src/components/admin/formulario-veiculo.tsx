"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { GripVertical, ImagePlus, Loader2, Save, Trash2 } from "lucide-react";
import { salvarVeiculo } from "@/acoes/veiculos";
import { ESTADO_VEICULO } from "@/lib/estados-formulario";
import type {
  DadosFormularioVeiculo,
  Imagem,
} from "@/lib/veiculo-formulario";
import {
  AreaTexto,
  Botao,
  Campo,
  GrupoCampo,
  Rotulo,
  Selecao,
} from "@/components/ui";
import { FotoVeiculo } from "@/components/foto-veiculo";
import {
  CAMBIO,
  CARROCERIA,
  COMBUSTIVEL,
  CONDICAO,
  STATUS_VEICULO,
  opcoes,
} from "@/lib/labels";
import { cn } from "@/lib/utils";

export function FormularioVeiculo({
  inicial,
  marcas,
  modelos,
  opcionaisDisponiveis,
}: {
  inicial: DadosFormularioVeiculo;
  marcas: Array<{ id: string; nome: string }>;
  modelos: Array<{ id: string; nome: string; marcaId: string }>;
  opcionaisDisponiveis: Array<{ id: string; nome: string; categoria: string }>;
}) {
  const [estado, acao, salvando] = useActionState(salvarVeiculo, ESTADO_VEICULO);

  const [marcaId, setMarcaId] = useState(inicial.marcaId);
  const [modeloId, setModeloId] = useState(inicial.modeloId);
  const [imagens, setImagens] = useState<Imagem[]>(inicial.imagens);
  const [selecionados, setSelecionados] = useState<string[]>(inicial.opcionais);
  const [enviandoFotos, setEnviandoFotos] = useState(false);
  const [erroUpload, setErroUpload] = useState("");
  const inputArquivo = useRef<HTMLInputElement>(null);

  const modelosDaMarca = modelos.filter((m) => m.marcaId === marcaId);

  const categorias = useMemo(() => {
    const rotulos: Record<string, string> = {
      Seguranca: "Segurança",
      Conforto: "Conforto",
      Tecnologia: "Tecnologia e multimídia",
      Externo: "Externo",
    };
    const mapa = new Map<string, typeof opcionaisDisponiveis>();
    for (const o of opcionaisDisponiveis) {
      const lista = mapa.get(o.categoria) ?? [];
      lista.push(o);
      mapa.set(o.categoria, lista);
    }
    return [...mapa.entries()].map(
      ([chave, itens]) => [rotulos[chave] ?? chave, itens] as const,
    );
  }, [opcionaisDisponiveis]);

  async function enviarFotos(arquivos: FileList | null) {
    if (!arquivos || arquivos.length === 0) return;
    setErroUpload("");
    setEnviandoFotos(true);

    const dados = new FormData();
    for (const arquivo of Array.from(arquivos)) dados.append("arquivos", arquivo);

    try {
      const resposta = await fetch("/api/upload", { method: "POST", body: dados });
      const json = await resposta.json();
      if (!resposta.ok) {
        setErroUpload(json.erro ?? "Falha ao enviar as fotos.");
        return;
      }
      setImagens((atual) => [
        ...atual,
        ...(json.urls as string[]).map((url) => ({ url, alt: "" })),
      ]);
    } catch {
      setErroUpload("Falha de conexão ao enviar as fotos.");
    } finally {
      setEnviandoFotos(false);
      if (inputArquivo.current) inputArquivo.current.value = "";
    }
  }

  function moverImagem(de: number, para: number) {
    setImagens((atual) => {
      if (para < 0 || para >= atual.length) return atual;
      const copia = [...atual];
      const [item] = copia.splice(de, 1);
      copia.splice(para, 0, item);
      return copia;
    });
  }

  return (
    <form action={acao} className="space-y-5">
      {inicial.id && <input type="hidden" name="id" value={inicial.id} />}
      <input type="hidden" name="imagens" value={JSON.stringify(imagens)} />
      <input type="hidden" name="opcionais" value={JSON.stringify(selecionados)} />

      {estado.mensagem && (
        <p className="rounded-[var(--radius-sm)] bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {estado.mensagem}
        </p>
      )}

      {/* ------------------------------------------------------ identificação */}
      <Bloco titulo="Identificação">
        <div className="grid gap-4 md:grid-cols-3">
          <GrupoCampo rotulo="Marca" obrigatorio erro={estado.erros?.marcaId}>
            <Selecao
              name="marcaId"
              value={marcaId}
              onChange={(e) => {
                setMarcaId(e.target.value);
                setModeloId("");
              }}
              required
            >
              <option value="">Selecione…</option>
              {marcas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </Selecao>
          </GrupoCampo>

          <GrupoCampo rotulo="Modelo" erro={estado.erros?.modeloId}>
            <Selecao
              name="modeloId"
              value={modeloId}
              onChange={(e) => setModeloId(e.target.value)}
              disabled={!marcaId}
            >
              <option value="">
                {marcaId ? "Selecione…" : "Escolha a marca primeiro"}
              </option>
              {modelosDaMarca.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </Selecao>
          </GrupoCampo>

          <GrupoCampo
            rotulo="Ou cadastrar novo modelo"
            ajuda="Preenchendo aqui, o modelo é criado automaticamente."
          >
            <Campo name="modeloNovo" placeholder="Ex.: Corolla Cross" />
          </GrupoCampo>

          <GrupoCampo
            rotulo="Versão"
            obrigatorio
            erro={estado.erros?.versao}
            className="md:col-span-3"
          >
            <Campo
              name="versao"
              defaultValue={inicial.versao}
              placeholder="2.0 16V TURBO FLEX M SPORT AUTOMÁTICO"
              required
            />
          </GrupoCampo>

          <GrupoCampo rotulo="Ano de fabricação" obrigatorio erro={estado.erros?.anoFabricacao}>
            <Campo
              name="anoFabricacao"
              inputMode="numeric"
              defaultValue={inicial.anoFabricacao}
              required
            />
          </GrupoCampo>

          <GrupoCampo rotulo="Ano do modelo" obrigatorio erro={estado.erros?.anoModelo}>
            <Campo
              name="anoModelo"
              inputMode="numeric"
              defaultValue={inicial.anoModelo}
              required
            />
          </GrupoCampo>

          <GrupoCampo rotulo="Condição" obrigatorio>
            <Selecao name="condicao" defaultValue={inicial.condicao}>
              {opcoes(CONDICAO).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Selecao>
          </GrupoCampo>
        </div>
      </Bloco>

      {/* ------------------------------------------------------------ valores */}
      <Bloco titulo="Valores">
        <div className="grid gap-4 md:grid-cols-4">
          <GrupoCampo rotulo="Preço de venda (R$)" obrigatorio erro={estado.erros?.preco}>
            <Campo
              name="preco"
              inputMode="numeric"
              defaultValue={inicial.preco}
              placeholder="149.900,00"
              required
            />
          </GrupoCampo>
          <GrupoCampo rotulo="Preço &quot;de&quot; (R$)" ajuda="Opcional, aparece riscado.">
            <Campo name="precoDe" inputMode="numeric" defaultValue={inicial.precoDe} />
          </GrupoCampo>
          <GrupoCampo rotulo="Tabela FIPE (R$)">
            <Campo name="precoFipe" inputMode="numeric" defaultValue={inicial.precoFipe} />
          </GrupoCampo>
          <GrupoCampo rotulo="Média de mercado (R$)">
            <Campo name="precoMedio" inputMode="numeric" defaultValue={inicial.precoMedio} />
          </GrupoCampo>
        </div>
      </Bloco>

      {/* ---------------------------------------------------------- ficha */}
      <Bloco titulo="Ficha técnica">
        <div className="grid gap-4 md:grid-cols-4">
          <GrupoCampo rotulo="Quilometragem" obrigatorio erro={estado.erros?.quilometragem}>
            <Campo
              name="quilometragem"
              inputMode="numeric"
              defaultValue={inicial.quilometragem}
              required
            />
          </GrupoCampo>

          <GrupoCampo rotulo="Câmbio" obrigatorio>
            <Selecao name="cambio" defaultValue={inicial.cambio}>
              {opcoes(CAMBIO).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Selecao>
          </GrupoCampo>

          <GrupoCampo rotulo="Combustível" obrigatorio>
            <Selecao name="combustivel" defaultValue={inicial.combustivel}>
              {opcoes(COMBUSTIVEL).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Selecao>
          </GrupoCampo>

          <GrupoCampo rotulo="Carroceria" obrigatorio>
            <Selecao name="carroceria" defaultValue={inicial.carroceria}>
              {opcoes(CARROCERIA).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Selecao>
          </GrupoCampo>

          <GrupoCampo rotulo="Cor" obrigatorio erro={estado.erros?.cor}>
            <Campo name="cor" defaultValue={inicial.cor} placeholder="Prata" required />
          </GrupoCampo>

          <GrupoCampo rotulo="Portas" obrigatorio>
            <Campo name="portas" inputMode="numeric" defaultValue={inicial.portas} required />
          </GrupoCampo>

          <GrupoCampo rotulo="Final da placa">
            <Campo name="finalPlaca" maxLength={1} defaultValue={inicial.finalPlaca} />
          </GrupoCampo>

          <GrupoCampo rotulo="Placa" ajuda="Uso interno, não aparece no site.">
            <Campo name="placa" defaultValue={inicial.placa} placeholder="ABC1D23" />
          </GrupoCampo>

          <GrupoCampo rotulo="Renavam" ajuda="Uso interno." className="md:col-span-2">
            <Campo name="renavam" defaultValue={inicial.renavam} />
          </GrupoCampo>

          <GrupoCampo rotulo="Cidade">
            <Campo name="cidade" defaultValue={inicial.cidade} />
          </GrupoCampo>

          <GrupoCampo rotulo="UF">
            <Campo name="estado" maxLength={2} defaultValue={inicial.estado} placeholder="MG" />
          </GrupoCampo>
        </div>

        <div className="mt-5 grid gap-3 border-t border-line pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <Marcador nome="blindado" rotulo="Blindado" padrao={inicial.blindado} />
          <Marcador nome="aceitaTroca" rotulo="Aceita troca" padrao={inicial.aceitaTroca} />
          <Marcador nome="unicoDono" rotulo="Único dono" padrao={inicial.unicoDono} />
          <Marcador nome="ipvaPago" rotulo="IPVA pago" padrao={inicial.ipvaPago} />
          <Marcador nome="licenciado" rotulo="Licenciado" padrao={inicial.licenciado} />
          <Marcador
            nome="garantiaFabrica"
            rotulo="Garantia de fábrica"
            padrao={inicial.garantiaFabrica}
          />
          <Marcador
            nome="revisoesEmDia"
            rotulo="Revisões em dia"
            padrao={inicial.revisoesEmDia}
          />
        </div>
      </Bloco>

      {/* ----------------------------------------------------------- fotos */}
      <Bloco titulo="Fotos">
        <input
          ref={inputArquivo}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(e) => enviarFotos(e.target.files)}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Botao
            type="button"
            variante="contorno"
            onClick={() => inputArquivo.current?.click()}
            disabled={enviandoFotos}
          >
            {enviandoFotos ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Enviando…
              </>
            ) : (
              <>
                <ImagePlus size={16} /> Adicionar fotos
              </>
            )}
          </Botao>
          <p className="text-xs text-text-muted">
            JPG, PNG, WEBP ou AVIF até 8 MB. A primeira foto é a capa.
          </p>
        </div>

        {erroUpload && (
          <p className="mt-3 rounded-[var(--radius-sm)] bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
            {erroUpload}
          </p>
        )}

        {imagens.length > 0 && (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {imagens.map((img, i) => (
              <li
                key={`${img.url}-${i}`}
                className="overflow-hidden rounded-[var(--radius-sm)] border border-line bg-surface-2"
              >
                <div className="relative aspect-[4/3]">
                  <FotoVeiculo url={img.url} alt={img.alt} sizes="220px" />
                  {i === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      Capa
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 p-2">
                  <button
                    type="button"
                    onClick={() => moverImagem(i, i - 1)}
                    disabled={i === 0}
                    title="Mover para a esquerda"
                    className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:bg-surface-3 disabled:opacity-30"
                  >
                    <GripVertical size={14} className="rotate-90" />
                  </button>
                  <input
                    value={img.alt}
                    onChange={(e) =>
                      setImagens((atual) =>
                        atual.map((item, idx) =>
                          idx === i ? { ...item, alt: e.target.value } : item,
                        ),
                      )
                    }
                    placeholder="Descrição da foto"
                    className="h-8 min-w-0 flex-1 rounded-[var(--radius-sm)] border border-line bg-surface px-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImagens((atual) => atual.filter((_, idx) => idx !== i))
                    }
                    title="Remover foto"
                    className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Bloco>

      {/* ------------------------------------------------------- opcionais */}
      <Bloco titulo="Itens e opcionais">
        <div className="space-y-5">
          {categorias.map(([rotulo, itens]) => (
            <div key={rotulo}>
              <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                {rotulo}
              </p>
              <div className="flex flex-wrap gap-2">
                {itens.map((o) => {
                  const marcado = selecionados.includes(o.id);
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() =>
                        setSelecionados((atual) =>
                          marcado
                            ? atual.filter((id) => id !== o.id)
                            : [...atual, o.id],
                        )
                      }
                      className={cn(
                        "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        marcado
                          ? "border-brand bg-brand text-white"
                          : "border-line bg-surface text-text hover:bg-surface-2",
                      )}
                    >
                      {o.nome}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Bloco>

      {/* ------------------------------------------------------- publicação */}
      <Bloco titulo="Descrição e publicação">
        <div className="grid gap-4">
          <GrupoCampo rotulo="Descrição do anúncio">
            <AreaTexto
              name="descricao"
              rows={5}
              defaultValue={inicial.descricao}
              placeholder="Fale sobre o estado do veículo, histórico de revisões e diferenciais."
            />
          </GrupoCampo>

          <div className="grid gap-4 md:grid-cols-2">
            <GrupoCampo rotulo="Link de vídeo" ajuda="YouTube, Vimeo, etc.">
              <Campo name="videoUrl" defaultValue={inicial.videoUrl} />
            </GrupoCampo>
            <GrupoCampo rotulo="Link do tour 360°">
              <Campo name="tour360Url" defaultValue={inicial.tour360Url} />
            </GrupoCampo>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <GrupoCampo rotulo="Status" obrigatorio>
              <Selecao name="status" defaultValue={inicial.status}>
                {opcoes(STATUS_VEICULO).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Selecao>
            </GrupoCampo>

            <GrupoCampo rotulo="Ordem de exibição" ajuda="Menor número aparece primeiro.">
              <Campo name="ordem" inputMode="numeric" defaultValue={inicial.ordem} />
            </GrupoCampo>

            <div className="flex items-end pb-2.5">
              <Marcador
                nome="destaque"
                rotulo="Mostrar em destaque na home"
                padrao={inicial.destaque}
              />
            </div>
          </div>
        </div>
      </Bloco>

      <div className="sticky bottom-0 -mx-4 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex items-center justify-end gap-3">
          <Botao type="submit" tamanho="lg" disabled={salvando}>
            {salvando ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Salvando…
              </>
            ) : (
              <>
                <Save size={16} /> Salvar veículo
              </>
            )}
          </Botao>
        </div>
      </div>
    </form>
  );
}

function Bloco({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius)] border border-line bg-surface p-5 md:p-6">
      <h2 className="mb-5 text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function Marcador({
  nome,
  rotulo,
  padrao,
}: {
  nome: string;
  rotulo: string;
  padrao: boolean;
}) {
  return (
    <Rotulo className="flex cursor-pointer items-center gap-2.5 text-[13px] text-text">
      <input
        type="checkbox"
        name={nome}
        defaultChecked={padrao}
        className="h-4 w-4 cursor-pointer accent-[var(--brand)]"
      />
      {rotulo}
    </Rotulo>
  );
}
