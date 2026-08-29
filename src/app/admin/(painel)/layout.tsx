import { redirect } from "next/navigation";
import { BarraLateral } from "@/components/admin/barra-lateral";
import { sessaoAtual } from "@/lib/auth";
import { obterConfiguracao } from "@/lib/configuracao";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LayoutPainel({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await sessaoAtual();
  if (!sessao) redirect("/admin/login");

  // confere no banco se o usuário continua ativo (o proxy só valida o JWT)
  const usuario = await prisma.usuario.findUnique({
    where: { id: sessao.id },
    select: { nome: true, email: true, papel: true, ativo: true },
  });
  if (!usuario || !usuario.ativo) redirect("/admin/login");

  const [config, leadsNovos] = await Promise.all([
    obterConfiguracao(),
    prisma.lead.count({ where: { status: "NOVO" } }),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-surface-2 lg:flex-row">
      <BarraLateral
        nomeLoja={config.nomeLoja}
        usuario={usuario}
        leadsNovos={leadsNovos}
      />
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
