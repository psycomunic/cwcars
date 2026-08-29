import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { WhatsappFlutuante } from "@/components/site/whatsapp-flutuante";
import { obterConfiguracao } from "@/lib/configuracao";
import { variaveisDaMarca } from "@/lib/cores";

export default async function LayoutSite({
  children,
}: {
  children: React.ReactNode;
}) {
  const c = await obterConfiguracao();

  return (
    <>
      <style>{variaveisDaMarca(c.corPrimaria)}</style>
      <Header
        dados={{
          nomeLoja: c.nomeLoja,
          logoUrl: c.logoUrl,
          telefone: c.telefone,
          endereco: c.endereco,
          cidade: c.cidade,
          estado: c.estado,
          horarioVendas: c.horarioVendas,
          horarioServico: c.horarioServico,
          instagram: c.instagram,
          facebook: c.facebook,
          youtube: c.youtube,
        }}
      />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsappFlutuante />
    </>
  );
}
