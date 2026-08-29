"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Menu, Phone, MapPin, X } from "lucide-react";
import {
  IconeFacebook,
  IconeInstagram,
  IconeYoutube,
} from "@/components/icones-sociais";
import { Logo } from "@/components/site/logo";
import { BotaoLink } from "@/components/ui";
import { cn } from "@/lib/utils";

export type DadosHeader = {
  nomeLoja: string;
  logoUrl: string | null;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  horarioVendas: string;
  horarioServico: string;
  instagram: string;
  facebook: string;
  youtube: string;
};

const TIPOS = [
  { label: "SUVs", href: "/estoque?carroceria=SUV" },
  { label: "Sedãs", href: "/estoque?carroceria=SEDA" },
  { label: "Hatches", href: "/estoque?carroceria=HATCH" },
  { label: "Picapes", href: "/estoque?carroceria=PICAPE" },
  { label: "Coupés", href: "/estoque?carroceria=COUPE" },
  { label: "Elétricos e híbridos", href: "/estoque?combustivel=ELETRICO" },
];

const LINKS = [
  { label: "Início", href: "/" },
  { label: "Estoque", href: "/estoque" },
  { label: "Financiamento", href: "/financiamento" },
  { label: "Avaliar meu carro", href: "/avaliar-troca" },
  { label: "Sobre nós", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];

export function Header({ dados }: { dados: DadosHeader }) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);
  const [tiposAberto, setTiposAberto] = useState(false);
  const [rotaAnterior, setRotaAnterior] = useState(pathname);

  // ao trocar de página, fecha os menus (ajuste de estado durante a renderização)
  if (rotaAnterior !== pathname) {
    setRotaAnterior(pathname);
    setAberto(false);
    setTiposAberto(false);
  }

  const ativo = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* barra superior */}
      <div className="hidden bg-ink text-white/75 lg:block">
        <div className="container-page flex h-9 items-center justify-between text-[12px]">
          <div className="flex items-center gap-5">
            {dados.endereco && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} className="text-brand" />
                {dados.endereco}
                {dados.cidade && `, ${dados.cidade} - ${dados.estado}`}
              </span>
            )}
            {dados.telefone && (
              <a
                href={`tel:${dados.telefone.replace(/\D/g, "")}`}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
              >
                <Phone size={13} className="text-brand" />
                {dados.telefone}
              </a>
            )}
          </div>
          <div className="flex items-center gap-5">
            <span>Vendas: {dados.horarioVendas}</span>
            <span className="text-white/25">|</span>
            <span>Oficina: {dados.horarioServico}</span>
            <span className="flex items-center gap-3 pl-2">
              {dados.facebook && (
                <a href={dados.facebook} aria-label="Facebook" className="hover:text-white">
                  <IconeFacebook size={14} />
                </a>
              )}
              {dados.instagram && (
                <a href={dados.instagram} aria-label="Instagram" className="hover:text-white">
                  <IconeInstagram size={14} />
                </a>
              )}
              {dados.youtube && (
                <a href={dados.youtube} aria-label="YouTube" className="hover:text-white">
                  <IconeYoutube size={14} />
                </a>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* barra principal */}
      <div className="border-b border-line bg-surface">
        <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-4">
          <Logo nome={dados.nomeLoja} logoUrl={dados.logoUrl} />

          <nav className="hidden items-center gap-1 lg:flex">
            {LINKS.slice(0, 2).map((l) => (
              <ItemNav key={l.href} href={l.href} ativo={ativo(l.href)}>
                {l.label}
              </ItemNav>
            ))}

            <div
              className="relative"
              onMouseEnter={() => setTiposAberto(true)}
              onMouseLeave={() => setTiposAberto(false)}
            >
              <button
                type="button"
                onClick={() => setTiposAberto((v) => !v)}
                aria-expanded={tiposAberto}
                className="inline-flex h-[var(--header-h)] cursor-pointer items-center gap-1 px-3 text-[13px] font-semibold uppercase tracking-wide text-text transition-colors hover:text-brand"
              >
                Por tipo
                <ChevronDown
                  size={14}
                  className={cn("transition-transform", tiposAberto && "rotate-180")}
                />
              </button>
              {tiposAberto && (
                <div className="absolute left-0 top-full w-60 overflow-hidden rounded-b-[var(--radius)] border border-line bg-surface py-1 shadow-[var(--shadow-pop)]">
                  {TIPOS.map((t) => (
                    <Link
                      key={t.href}
                      href={t.href}
                      className="block px-4 py-2.5 text-sm text-text transition-colors hover:bg-surface-2 hover:text-brand"
                    >
                      {t.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {LINKS.slice(2).map((l) => (
              <ItemNav key={l.href} href={l.href} ativo={ativo(l.href)}>
                {l.label}
              </ItemNav>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <BotaoLink href="/financiamento" className="hidden md:inline-flex">
              Simular financiamento
            </BotaoLink>
            <button
              type="button"
              onClick={() => setAberto((v) => !v)}
              aria-label={aberto ? "Fechar menu" : "Abrir menu"}
              aria-expanded={aberto}
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-line lg:hidden"
            >
              {aberto ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* menu mobile */}
      {aberto && (
        <div className="border-b border-line bg-surface lg:hidden">
          <nav className="container-page flex flex-col py-2">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "border-b border-line/70 py-3.5 text-sm font-semibold",
                  ativo(l.href) ? "text-brand" : "text-text",
                )}
              >
                {l.label}
              </Link>
            ))}
            <div className="py-3">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Comprar por tipo
              </p>
              <div className="flex flex-wrap gap-2">
                {TIPOS.map((t) => (
                  <Link
                    key={t.href}
                    href={t.href}
                    className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-text"
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>
            <BotaoLink href="/financiamento" className="my-3">
              Simular financiamento
            </BotaoLink>
          </nav>
        </div>
      )}
    </header>
  );
}

function ItemNav({
  href,
  ativo,
  children,
}: {
  href: string;
  ativo: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative inline-flex h-[var(--header-h)] items-center px-3 text-[13px] font-semibold uppercase tracking-wide transition-colors",
        ativo ? "text-brand" : "text-text hover:text-brand",
      )}
    >
      {children}
      {ativo && (
        <span className="absolute inset-x-3 bottom-4 h-0.5 rounded-full bg-brand" />
      )}
    </Link>
  );
}
