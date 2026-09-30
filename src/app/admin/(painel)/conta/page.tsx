import { redirect } from "next/navigation";
import { FormularioMinhaSenha } from "@/components/admin/formularios-usuario";
import { Selo } from "@/components/ui";
import { sessaoAtual } from "@/lib/auth";
import { NOME_DO_PAPEL, RESUMO_DO_PAPEL, type Papel } from "@/lib/permissoes";

export const dynamic = "force-dynamic";

/**
 * A própria conta. Fica fora de /admin/usuarios de propósito: trocar a própria
 * senha não é gerenciar usuários, e vendedor precisa poder fazer isso.
 */
export default async function PaginaMinhaConta() {
  const sessao = await sessaoAtual();
  if (!sessao) redirect("/admin/login");

  const papel = sessao.papel as Papel;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-text">
          Minha conta
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Seus dados de acesso ao painel.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr] lg:items-start">
        <div className="rounded-[var(--radius)] border border-line bg-surface p-5">
          <h2 className="mb-4 text-sm font-bold text-text">Trocar senha</h2>
          <FormularioMinhaSenha />
        </div>

        <div className="rounded-[var(--radius)] border border-line bg-surface p-5">
          <h2 className="mb-4 text-sm font-bold text-text">Seus dados</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-medium text-text-muted">Nome</dt>
              <dd className="text-text">{sessao.nome}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-text-muted">E-mail</dt>
              <dd className="text-text">{sessao.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-text-muted">Papel</dt>
              <dd className="mt-1 flex flex-wrap items-center gap-2">
                <Selo tom={papel === "ADMIN" ? "marca" : "neutro"}>
                  {NOME_DO_PAPEL[papel]}
                </Selo>
                <span className="text-xs text-text-muted">
                  {RESUMO_DO_PAPEL[papel]}
                </span>
              </dd>
            </div>
          </dl>
          <p className="mt-5 border-t border-line pt-4 text-xs text-text-muted">
            Nome, e-mail e papel são alterados por um administrador, em Usuários.
          </p>
        </div>
      </div>
    </>
  );
}
