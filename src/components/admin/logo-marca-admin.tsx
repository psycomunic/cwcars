"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { salvarLogoMarca } from "@/acoes/admin";
import { LogoMarca } from "@/components/logo-marca";

/**
 * Envio do arquivo de logo de uma marca.
 * Só aparece como "obrigatório" para marcas sem traçado pronto — nas demais
 * serve para substituir o traçado padrão pelo logo oficial colorido da loja.
 */
export function LogoMarcaAdmin({
  id,
  nome,
  slug,
  logoUrl,
  temTracado,
}: {
  id: string;
  nome: string;
  slug: string;
  logoUrl: string | null;
  temTracado: boolean;
}) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, iniciarSalvamento] = useTransition();
  const input = useRef<HTMLInputElement>(null);

  function persistir(url: string) {
    const dados = new FormData();
    dados.set("id", id);
    dados.set("logoUrl", url);
    iniciarSalvamento(() => {
      salvarLogoMarca(dados);
    });
  }

  async function enviar(arquivos: FileList | null) {
    if (!arquivos || arquivos.length === 0) return;
    setErro("");
    setEnviando(true);

    const dados = new FormData();
    dados.append("arquivos", arquivos[0]);

    try {
      const resposta = await fetch("/api/upload", { method: "POST", body: dados });
      const json = await resposta.json();
      if (!resposta.ok || !json.urls?.[0]) {
        setErro(json.erro ?? "Falha ao enviar o arquivo.");
        return;
      }
      persistir(json.urls[0]);
    } catch {
      setErro("Falha de conexão ao enviar o arquivo.");
    } finally {
      setEnviando(false);
      if (input.current) input.current.value = "";
    }
  }

  const ocupado = enviando || salvando;

  return (
    <div className="flex items-center gap-2">
      <input
        ref={input}
        type="file"
        accept="image/png,image/webp,image/jpeg,image/avif,image/svg+xml"
        className="hidden"
        onChange={(e) => enviar(e.target.files)}
      />

      <span className="group inline-flex h-10 w-14 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-line bg-surface-2">
        <LogoMarca nome={nome} slug={slug} logoUrl={logoUrl} className="h-7 text-xs" />
      </span>

      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={ocupado}
        title={logoUrl ? "Trocar o logo" : "Enviar logo"}
        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] border border-line px-2.5 text-xs font-semibold text-text-muted transition-colors hover:bg-surface-2 hover:text-text disabled:opacity-50"
      >
        {ocupado ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <ImagePlus size={14} />
        )}
        {logoUrl ? "Trocar" : temTracado ? "Substituir" : "Enviar logo"}
      </button>

      {logoUrl && (
        <button
          type="button"
          onClick={() => persistir("")}
          disabled={ocupado}
          title="Remover o arquivo e voltar ao padrão"
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-text-muted transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <X size={15} />
        </button>
      )}

      {erro && <span className="text-xs font-medium text-danger">{erro}</span>}
    </div>
  );
}
