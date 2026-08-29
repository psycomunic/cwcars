import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import {
  IconeFacebook,
  IconeInstagram,
  IconeYoutube,
} from "@/components/icones-sociais";
import { Logo } from "@/components/site/logo";
import { obterConfiguracao } from "@/lib/configuracao";

const LINKS_RAPIDOS = [
  { label: "Estoque completo", href: "/estoque" },
  { label: "SUVs", href: "/estoque?carroceria=SUV" },
  { label: "Sedãs", href: "/estoque?carroceria=SEDA" },
  { label: "Picapes", href: "/estoque?carroceria=PICAPE" },
  { label: "Financiamento", href: "/financiamento" },
  { label: "Avaliar meu carro", href: "/avaliar-troca" },
];

const LINKS_INSTITUCIONAIS = [
  { label: "Sobre nós", href: "/sobre" },
  { label: "Contato", href: "/contato" },
  { label: "Política de privacidade", href: "/privacidade" },
  { label: "Área do administrador", href: "/admin" },
];

export async function Footer() {
  const c = await obterConfiguracao();
  const ano = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-ink text-white/70">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo nome={c.nomeLoja} logoUrl={c.logoUrl} invertido />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            {c.slogan ||
              "Mais que uma loja de carros. Somos seu parceiro automotivo para a vida toda."}
          </p>
          <div className="mt-5 flex gap-3">
            {c.facebook && (
              <IconeSocial href={c.facebook} rotulo="Facebook">
                <IconeFacebook size={16} />
              </IconeSocial>
            )}
            {c.instagram && (
              <IconeSocial href={c.instagram} rotulo="Instagram">
                <IconeInstagram size={16} />
              </IconeSocial>
            )}
            {c.youtube && (
              <IconeSocial href={c.youtube} rotulo="YouTube">
                <IconeYoutube size={16} />
              </IconeSocial>
            )}
          </div>
        </div>

        <ColunaLinks titulo="Navegação" links={LINKS_RAPIDOS} />
        <ColunaLinks titulo="Institucional" links={LINKS_INSTITUCIONAIS} />

        <div>
          <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
            Atendimento
          </h3>
          <ul className="space-y-3 text-sm">
            {c.telefone && (
              <li className="flex items-start gap-2.5">
                <Phone size={15} className="mt-0.5 shrink-0 text-brand" />
                <a
                  href={`tel:${c.telefone.replace(/\D/g, "")}`}
                  className="transition-colors hover:text-white"
                >
                  {c.telefone}
                </a>
              </li>
            )}
            {c.email && (
              <li className="flex items-start gap-2.5">
                <Mail size={15} className="mt-0.5 shrink-0 text-brand" />
                <a
                  href={`mailto:${c.email}`}
                  className="transition-colors hover:text-white"
                >
                  {c.email}
                </a>
              </li>
            )}
            {c.endereco && (
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="mt-0.5 shrink-0 text-brand" />
                <span>
                  {c.endereco}
                  <br />
                  {c.cidade} - {c.estado} {c.cep && `· ${c.cep}`}
                </span>
              </li>
            )}
            <li className="flex items-start gap-2.5">
              <Clock size={15} className="mt-0.5 shrink-0 text-brand" />
              <span>
                Vendas: {c.horarioVendas}
                <br />
                Oficina: {c.horarioServico}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs md:flex-row">
          <p>
            © {ano} {c.nomeLoja}. Todos os direitos reservados.
          </p>
          <p className="text-white/45">
            Os valores e informações dos veículos estão sujeitos a alteração sem aviso prévio.
          </p>
        </div>
      </div>
    </footer>
  );
}

function ColunaLinks({
  titulo,
  links,
}: {
  titulo: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
        {titulo}
      </h3>
      <ul className="space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IconeSocial({
  href,
  rotulo,
  children,
}: {
  href: string;
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={rotulo}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-white/80 transition-colors hover:bg-brand hover:text-white"
    >
      {children}
    </a>
  );
}
