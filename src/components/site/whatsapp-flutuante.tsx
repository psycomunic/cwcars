import { IconeWhatsapp } from "@/components/icones-sociais";
import { linkWhatsapp, obterConfiguracao } from "@/lib/configuracao";

export async function WhatsappFlutuante() {
  const c = await obterConfiguracao();
  const href = linkWhatsapp(
    c.whatsapp,
    `Olá! Vim pelo site da ${c.nomeLoja} e gostaria de mais informações.`,
  );
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[var(--shadow-pop)] transition-transform hover:scale-105"
    >
      <IconeWhatsapp size={27} />
    </a>
  );
}
