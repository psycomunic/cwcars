import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FormularioLogin } from "@/components/admin/formulario-login";
import { sessaoAtual } from "@/lib/auth";
import { obterConfiguracao } from "@/lib/configuracao";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrar no painel",
  robots: { index: false, follow: false },
};

export default async function PaginaLogin(props: PageProps<"/admin/login">) {
  const sessao = await sessaoAtual();
  if (sessao) redirect("/admin");

  const params = await props.searchParams;
  const proximo = Array.isArray(params.proximo)
    ? params.proximo[0]
    : params.proximo;

  const config = await obterConfiguracao();

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-7 text-center">
          <p className="font-display text-2xl font-black tracking-tight text-white">
            {config.nomeLoja.toUpperCase()}
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/40">
            Painel administrativo
          </p>
        </div>

        <div className="rounded-[var(--radius)] bg-surface p-6 shadow-[var(--shadow-pop)]">
          <FormularioLogin proximo={proximo} />
        </div>

        <p className="mt-5 text-center text-xs text-white/35">
          Acesso restrito à equipe da loja.
        </p>
      </div>
    </div>
  );
}
