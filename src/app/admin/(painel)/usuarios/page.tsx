import { redirect } from "next/navigation";
import { Power, Trash2 } from "lucide-react";
import {
  alterarPapel,
  alternarAtivo,
  excluirUsuario,
} from "@/acoes/usuarios";
import {
  FormularioDefinirSenha,
  FormularioNovoUsuario,
} from "@/components/admin/formularios-usuario";
import { Selo, Selecao, Vazio } from "@/components/ui";
import { sessaoAtual } from "@/lib/auth";
import { data } from "@/lib/format";
import { NOME_DO_PAPEL, PAPEIS, pode, type Papel } from "@/lib/permissoes";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PaginaAdminUsuarios() {
  const sessao = await sessaoAtual();
  if (!sessao) redirect("/admin/login");
  if (!pode(sessao.papel, "gerenciarUsuarios")) redirect("/admin");

  const usuarios = await prisma.usuario.findMany({
    orderBy: [{ ativo: "desc" }, { criadoEm: "asc" }],
    select: {
      id: true,
      nome: true,
      email: true,
      papel: true,
      ativo: true,
      criadoEm: true,
    },
  });

  const admins = usuarios.filter((u) => u.papel === "ADMIN" && u.ativo);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-text">
          Usuários
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Quem entra no painel e até onde vai. <strong>Vendedor</strong> cadastra
          veículos e atende leads; <strong>administrador</strong> também mexe em
          configurações, marcas, financeiro e nesta tela.
        </p>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr] lg:items-start">
        <div className="rounded-[var(--radius)] border border-line bg-surface p-5">
          <h2 className="mb-4 text-sm font-bold text-text">Novo usuário</h2>
          <FormularioNovoUsuario />
        </div>

        <div className="space-y-3">
          {usuarios.length === 0 ? (
            <Vazio titulo="Nenhum usuário" descricao="Crie o primeiro ao lado." />
          ) : (
            usuarios.map((usuario) => {
              const souEu = usuario.id === sessao.id;
              // travas que evitam o painel ficar sem nenhum administrador
              const ultimoAdmin =
                usuario.papel === "ADMIN" && usuario.ativo && admins.length === 1;

              return (
                <article
                  key={usuario.id}
                  className="rounded-[var(--radius)] border border-line bg-surface p-5"
                >
                  <header className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-[15px] font-bold text-text">
                          {usuario.nome}
                        </h2>
                        {souEu && <Selo tom="suave">você</Selo>}
                        {!usuario.ativo && <Selo tom="perigo">desativado</Selo>}
                      </div>
                      <p className="mt-0.5 truncate text-sm text-text-muted">
                        {usuario.email}
                      </p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        No painel desde {data(usuario.criadoEm)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <form action={alternarAtivo}>
                        <input type="hidden" name="id" value={usuario.id} />
                        <button
                          type="submit"
                          disabled={souEu || ultimoAdmin}
                          title={
                            souEu
                              ? "Você não pode desativar a si mesmo"
                              : ultimoAdmin
                                ? "É o último administrador ativo"
                                : usuario.ativo
                                  ? "Desativar o acesso"
                                  : "Reativar o acesso"
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-line text-text-muted transition-colors hover:bg-surface-2 hover:text-text disabled:pointer-events-none disabled:opacity-40"
                        >
                          <Power size={15} />
                        </button>
                      </form>

                      <form action={excluirUsuario}>
                        <input type="hidden" name="id" value={usuario.id} />
                        <button
                          type="submit"
                          disabled={souEu || ultimoAdmin}
                          title={
                            souEu
                              ? "Você não pode excluir a si mesmo"
                              : ultimoAdmin
                                ? "É o último administrador ativo"
                                : "Excluir usuário"
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-line text-text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-40"
                        >
                          <Trash2 size={15} />
                        </button>
                      </form>
                    </div>
                  </header>

                  <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-line pt-4">
                    <form action={alterarPapel} className="flex items-end gap-2">
                      <input type="hidden" name="id" value={usuario.id} />
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-text-muted">
                          Papel
                        </span>
                        <Selecao
                          name="papel"
                          defaultValue={usuario.papel}
                          disabled={ultimoAdmin}
                          className="h-9 text-[13px]"
                        >
                          {PAPEIS.map((papel) => (
                            <option key={papel} value={papel}>
                              {NOME_DO_PAPEL[papel as Papel]}
                            </option>
                          ))}
                        </Selecao>
                      </label>
                      <button
                        type="submit"
                        disabled={ultimoAdmin}
                        className="h-9 rounded-[var(--radius-sm)] border border-line px-3 text-xs font-semibold text-text-muted transition-colors hover:bg-surface-2 hover:text-text disabled:pointer-events-none disabled:opacity-40"
                      >
                        Salvar
                      </button>
                    </form>

                    <FormularioDefinirSenha id={usuario.id} nome={usuario.nome} />
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
