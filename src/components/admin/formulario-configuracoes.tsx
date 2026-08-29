"use client";

import { useActionState, useRef, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, Save } from "lucide-react";
import { salvarConfiguracao } from "@/acoes/admin";
import { ESTADO_SIMPLES } from "@/lib/estados-formulario";
import { Botao, Campo, GrupoCampo } from "@/components/ui";

export type DadosConfiguracao = {
  nomeLoja: string;
  slogan: string;
  logoUrl: string;
  corPrimaria: string;
  telefone: string;
  whatsapp: string;
  email: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  mapaUrl: string;
  horarioVendas: string;
  horarioServico: string;
  instagram: string;
  facebook: string;
  youtube: string;
  tiktok: string;
};

export function FormularioConfiguracoes({
  inicial,
}: {
  inicial: DadosConfiguracao;
}) {
  const [estado, acao, salvando] = useActionState(
    salvarConfiguracao,
    ESTADO_SIMPLES,
  );

  const [logoUrl, setLogoUrl] = useState(inicial.logoUrl);
  const [cor, setCor] = useState(inicial.corPrimaria);
  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const inputLogo = useRef<HTMLInputElement>(null);

  async function enviarLogo(arquivos: FileList | null) {
    if (!arquivos || arquivos.length === 0) return;
    setEnviandoLogo(true);
    const dados = new FormData();
    dados.append("arquivos", arquivos[0]);
    try {
      const resposta = await fetch("/api/upload", { method: "POST", body: dados });
      const json = await resposta.json();
      if (resposta.ok && json.urls?.[0]) setLogoUrl(json.urls[0]);
    } finally {
      setEnviandoLogo(false);
      if (inputLogo.current) inputLogo.current.value = "";
    }
  }

  return (
    <form action={acao} className="space-y-5">
      <input type="hidden" name="logoUrl" value={logoUrl} />

      <Bloco titulo="Identidade">
        <div className="grid gap-4 md:grid-cols-2">
          <GrupoCampo rotulo="Nome da loja" obrigatorio erro={estado.erros?.nomeLoja}>
            <Campo name="nomeLoja" defaultValue={inicial.nomeLoja} required />
          </GrupoCampo>
          <GrupoCampo rotulo="Slogan">
            <Campo name="slogan" defaultValue={inicial.slogan} />
          </GrupoCampo>

          <GrupoCampo
            rotulo="Cor principal"
            erro={estado.erros?.corPrimaria}
            ajuda="Usada em botões, links e destaques do site."
          >
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={cor}
                onChange={(e) => setCor(e.target.value.toUpperCase())}
                aria-label="Escolher cor principal"
                className="h-11 w-14 cursor-pointer rounded-[var(--radius-sm)] border border-line bg-surface p-1"
              />
              <Campo
                name="corPrimaria"
                value={cor}
                onChange={(e) => setCor(e.target.value.toUpperCase())}
                className="font-mono"
              />
            </div>
          </GrupoCampo>

          <div className="space-y-1.5">
            <p className="text-[13px] font-medium text-text-muted">Logotipo</p>
            <input
              ref={inputLogo}
              type="file"
              accept="image/png,image/webp,image/jpeg,image/avif"
              className="hidden"
              onChange={(e) => enviarLogo(e.target.files)}
            />
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <span className="inline-flex h-11 items-center rounded-[var(--radius-sm)] border border-line bg-ink px-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl} alt="Logotipo" className="h-7 w-auto" />
                </span>
              ) : null}
              <Botao
                type="button"
                variante="contorno"
                onClick={() => inputLogo.current?.click()}
                disabled={enviandoLogo}
              >
                {enviandoLogo ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Enviando…
                  </>
                ) : (
                  <>
                    <ImagePlus size={16} /> {logoUrl ? "Trocar" : "Enviar"} logo
                  </>
                )}
              </Botao>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl("")}
                  className="cursor-pointer text-xs font-semibold text-text-muted hover:text-danger"
                >
                  Remover
                </button>
              )}
            </div>
          </div>
        </div>
      </Bloco>

      <Bloco titulo="Contato e endereço">
        <div className="grid gap-4 md:grid-cols-3">
          <GrupoCampo rotulo="Telefone">
            <Campo name="telefone" defaultValue={inicial.telefone} placeholder="(32) 3215-0198" />
          </GrupoCampo>
          <GrupoCampo rotulo="WhatsApp" ajuda="Usado no botão flutuante.">
            <Campo name="whatsapp" defaultValue={inicial.whatsapp} placeholder="(32) 98811-2233" />
          </GrupoCampo>
          <GrupoCampo rotulo="E-mail">
            <Campo name="email" type="email" defaultValue={inicial.email} />
          </GrupoCampo>

          <GrupoCampo rotulo="Endereço" className="md:col-span-2">
            <Campo name="endereco" defaultValue={inicial.endereco} />
          </GrupoCampo>
          <GrupoCampo rotulo="CEP">
            <Campo name="cep" defaultValue={inicial.cep} />
          </GrupoCampo>

          <GrupoCampo rotulo="Cidade">
            <Campo name="cidade" defaultValue={inicial.cidade} />
          </GrupoCampo>
          <GrupoCampo rotulo="UF">
            <Campo name="estado" maxLength={2} defaultValue={inicial.estado} />
          </GrupoCampo>
          <GrupoCampo
            rotulo="URL do mapa (embed)"
            ajuda="Cole o src do iframe do Google Maps."
          >
            <Campo name="mapaUrl" defaultValue={inicial.mapaUrl} />
          </GrupoCampo>

          <GrupoCampo rotulo="Horário — vendas">
            <Campo name="horarioVendas" defaultValue={inicial.horarioVendas} />
          </GrupoCampo>
          <GrupoCampo rotulo="Horário — oficina">
            <Campo name="horarioServico" defaultValue={inicial.horarioServico} />
          </GrupoCampo>
        </div>
      </Bloco>

      <Bloco titulo="Redes sociais">
        <div className="grid gap-4 md:grid-cols-2">
          <GrupoCampo rotulo="Instagram">
            <Campo name="instagram" defaultValue={inicial.instagram} placeholder="https://instagram.com/…" />
          </GrupoCampo>
          <GrupoCampo rotulo="Facebook">
            <Campo name="facebook" defaultValue={inicial.facebook} placeholder="https://facebook.com/…" />
          </GrupoCampo>
          <GrupoCampo rotulo="YouTube">
            <Campo name="youtube" defaultValue={inicial.youtube} placeholder="https://youtube.com/…" />
          </GrupoCampo>
          <GrupoCampo rotulo="TikTok">
            <Campo name="tiktok" defaultValue={inicial.tiktok} placeholder="https://tiktok.com/@…" />
          </GrupoCampo>
        </div>
      </Bloco>

      {estado.mensagem && (
        <p
          className={
            estado.ok
              ? "flex items-center gap-2 rounded-[var(--radius-sm)] bg-success/10 px-4 py-3 text-sm font-medium text-success"
              : "rounded-[var(--radius-sm)] bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
          }
        >
          {estado.ok && <CheckCircle2 size={16} />}
          {estado.mensagem}
        </p>
      )}

      <div className="flex justify-end">
        <Botao type="submit" tamanho="lg" disabled={salvando}>
          {salvando ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Salvando…
            </>
          ) : (
            <>
              <Save size={16} /> Salvar configurações
            </>
          )}
        </Botao>
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
