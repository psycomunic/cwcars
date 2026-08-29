"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Car,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Tags,
  X,
} from "lucide-react";
import { acaoSair } from "@/acoes/autenticacao";
import { cn } from "@/lib/utils";

const ITENS = [
  { href: "/admin", label: "Painel", icone: LayoutDashboard, exato: true },
  { href: "/admin/veiculos", label: "Veículos", icone: Car },
  { href: "/admin/leads", label: "Leads", icone: Inbox },
  { href: "/admin/marcas", label: "Marcas e modelos", icone: Tags },
  { href: "/admin/configuracoes", label: "Configurações", icone: Settings },
];

export function BarraLateral({
  nomeLoja,
  usuario,
  leadsNovos,
}: {
  nomeLoja: string;
  usuario: { nome: string; email: string; papel: string };
  leadsNovos: number;
}) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  const ativo = (href: string, exato?: boolean) =>
    exato ? pathname === href : pathname.startsWith(href);

  const conteudo = (
    <>
      <div className="px-5 py-5">
        <p className="font-display text-lg font-black tracking-tight text-white">
          {nomeLoja.toUpperCase()}
        </p>
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">
          Painel
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {ITENS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setAberto(false)}
            className={cn(
              "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium transition-colors",
              ativo(item.href, item.exato)
                ? "bg-brand text-white"
                : "text-white/65 hover:bg-white/8 hover:text-white",
            )}
          >
            <item.icone size={17} />
            {item.label}
            {item.href === "/admin/leads" && leadsNovos > 0 && (
              <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-[11px] font-bold text-white">
                {leadsNovos}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-[13px] text-white/55 transition-colors hover:bg-white/8 hover:text-white"
        >
          <ExternalLink size={15} />
          Ver o site
        </Link>

        <div className="mt-2 rounded-[var(--radius-sm)] bg-white/5 px-3 py-3">
          <p className="truncate text-[13px] font-semibold text-white">
            {usuario.nome}
          </p>
          <p className="truncate text-[11px] text-white/45">{usuario.email}</p>
          <form action={acaoSair} className="mt-2.5">
            <button
              type="submit"
              className="inline-flex cursor-pointer items-center gap-1.5 text-[12px] font-semibold text-white/60 transition-colors hover:text-brand"
            >
              <LogOut size={13} />
              Sair
            </button>
          </form>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* topo mobile */}
      <div className="flex items-center justify-between border-b border-line bg-ink px-4 py-3 lg:hidden">
        <p className="font-display text-base font-black text-white">
          {nomeLoja.toUpperCase()}
        </p>
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] bg-white/10 text-white"
        >
          {aberto ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {aberto && (
        <div className="flex flex-col bg-ink pb-4 lg:hidden">{conteudo}</div>
      )}

      <aside className="hidden w-64 shrink-0 flex-col bg-ink lg:sticky lg:top-0 lg:flex lg:h-screen">
        {conteudo}
      </aside>
    </>
  );
}
