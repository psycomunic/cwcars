import { Star, Trash2 } from "lucide-react";
import { alternarDestaqueMarca, excluirMarca, excluirModelo } from "@/acoes/admin";
import { FormularioMarca, FormularioModelo } from "@/components/admin/formularios-catalogo";
import { LogoMarcaAdmin } from "@/components/admin/logo-marca-admin";
import { logoDaMarca } from "@/lib/logos-marcas";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PaginaAdminMarcas() {
  const marcas = await prisma.marca.findMany({
    orderBy: [{ ordem: "asc" }, { nome: "asc" }],
    include: {
      modelos: {
        orderBy: { nome: "asc" },
        include: { _count: { select: { veiculos: true } } },
      },
      _count: { select: { veiculos: true } },
    },
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-text">
          Marcas e modelos
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Marcas em destaque aparecem na faixa da página inicial. O logotipo oficial
          já vem pronto para as principais montadoras — envie um arquivo apenas para
          as que aparecem só com o nome, ou para substituir o padrão. Marcas e modelos
          com veículos vinculados não podem ser excluídos.
        </p>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[var(--radius)] border border-line bg-surface p-5">
          <h2 className="mb-4 text-sm font-bold text-text">Nova marca</h2>
          <FormularioMarca />
        </div>
        <div className="rounded-[var(--radius)] border border-line bg-surface p-5">
          <h2 className="mb-4 text-sm font-bold text-text">Novo modelo</h2>
          <FormularioModelo
            marcas={marcas.map((m) => ({ id: m.id, nome: m.nome }))}
          />
        </div>
      </div>

      <div className="space-y-3">
        {marcas.map((marca) => (
          <section
            key={marca.id}
            className="rounded-[var(--radius)] border border-line bg-surface"
          >
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
              <div className="flex flex-wrap items-center gap-3">
                <LogoMarcaAdmin
                  id={marca.id}
                  nome={marca.nome}
                  slug={marca.slug}
                  logoUrl={marca.logoUrl}
                  temTracado={logoDaMarca(marca.slug) !== null}
                />
                <h2 className="text-[15px] font-bold text-text">{marca.nome}</h2>
                <span className="text-xs text-text-muted">
                  {marca._count.veiculos}{" "}
                  {marca._count.veiculos === 1 ? "veículo" : "veículos"} ·{" "}
                  {marca.modelos.length}{" "}
                  {marca.modelos.length === 1 ? "modelo" : "modelos"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <form action={alternarDestaqueMarca}>
                  <input type="hidden" name="id" value={marca.id} />
                  <button
                    type="submit"
                    title={
                      marca.destaque
                        ? "Remover da faixa de marcas"
                        : "Mostrar na faixa de marcas"
                    }
                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-text-muted transition-colors hover:bg-surface-2"
                  >
                    <Star
                      size={16}
                      className={
                        marca.destaque ? "fill-warning text-warning" : undefined
                      }
                    />
                  </button>
                </form>

                {marca._count.veiculos === 0 && (
                  <form action={excluirMarca}>
                    <input type="hidden" name="id" value={marca.id} />
                    <button
                      type="submit"
                      title="Excluir marca"
                      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 size={16} />
                    </button>
                  </form>
                )}
              </div>
            </header>

            {marca.modelos.length === 0 ? (
              <p className="px-5 py-4 text-sm text-text-muted">
                Nenhum modelo cadastrado nesta marca.
              </p>
            ) : (
              <ul className="flex flex-wrap gap-2 px-5 py-4">
                {marca.modelos.map((modelo) => (
                  <li
                    key={modelo.id}
                    className="inline-flex items-center gap-2 rounded-full bg-surface-2 py-1.5 pl-3.5 pr-1.5 text-xs font-medium text-text"
                  >
                    {modelo.nome}
                    <span className="text-text-muted">
                      ({modelo._count.veiculos})
                    </span>
                    {modelo._count.veiculos === 0 && (
                      <form action={excluirModelo}>
                        <input type="hidden" name="id" value={modelo.id} />
                        <button
                          type="submit"
                          title="Excluir modelo"
                          className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                        >
                          <Trash2 size={12} />
                        </button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
