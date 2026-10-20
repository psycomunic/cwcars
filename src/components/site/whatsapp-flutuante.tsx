import { IconeWhatsapp } from "@/components/icones-sociais";
import { prisma } from "@/lib/prisma";
import { obterConfiguracao } from "@/lib/configuracao";

/**
 * O href aponta para /whatsapp, não direto para o wa.me: é lá que o servidor
 * decide de qual sócio é a vez. Sem isso não haveria como dividir os leads.
 */
export async function WhatsappFlutuante() {
  const [atendentes, c] = await Promise.all([
    prisma.atendenteWhatsapp.count({ where: { ativo: true } }),
    obterConfiguracao(),
  ]);
  // nada cadastrado e nenhum número na loja: o botão não leva a lugar nenhum
  if (atendentes === 0 && !c.whatsapp) return null;

  return (
    <a
      href="/whatsapp?ctx=geral"
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[var(--shadow-pop)] transition-transform hover:scale-105"
    >
      <IconeWhatsapp size={27} />
    </a>
  );
}
