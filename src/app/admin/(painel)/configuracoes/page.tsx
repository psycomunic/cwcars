import { AtendentesWhatsapp } from "@/components/admin/atendentes-whatsapp";
import { FormularioConfiguracoes } from "@/components/admin/formulario-configuracoes";
import { obterConfiguracao } from "@/lib/configuracao";
import { listarAtendentes } from "@/lib/rodizio-whatsapp";

export const dynamic = "force-dynamic";

export default async function PaginaConfiguracoes() {
  const [c, atendentes] = await Promise.all([
    obterConfiguracao(),
    listarAtendentes(),
  ]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-text">
          Configurações
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Dados da loja usados no cabeçalho, rodapé e páginas de contato.
        </p>
      </div>

      <FormularioConfiguracoes
        inicial={{
          nomeLoja: c.nomeLoja,
          slogan: c.slogan,
          logoUrl: c.logoUrl ?? "",
          corPrimaria: c.corPrimaria,
          telefone: c.telefone,
          whatsapp: c.whatsapp,
          email: c.email,
          endereco: c.endereco,
          cidade: c.cidade,
          estado: c.estado,
          cep: c.cep,
          mapaUrl: c.mapaUrl,
          horarioVendas: c.horarioVendas,
          horarioServico: c.horarioServico,
          instagram: c.instagram,
          facebook: c.facebook,
          youtube: c.youtube,
          tiktok: c.tiktok,
        }}
      />

      <section className="mt-6 rounded-[var(--radius)] border border-line bg-surface p-5">
        <h2 className="mb-4 text-sm font-bold text-text">
          Rodízio do WhatsApp
        </h2>
        <AtendentesWhatsapp
          atendentes={atendentes.map((a) => ({
            id: a.id,
            nome: a.nome,
            telefone: a.telefone,
            ativo: a.ativo,
            atendimentos: a.atendimentos,
          }))}
        />
      </section>
    </>
  );
}
