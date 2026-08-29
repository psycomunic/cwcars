import Link from "next/link";

export function CabecalhoPagina({
  titulo,
  descricao,
  migalhas = [],
}: {
  titulo: string;
  descricao?: string;
  migalhas?: Array<{ label: string; href?: string }>;
}) {
  return (
    <div className="border-b border-line bg-surface-2">
      <div className="container-page py-9">
        <nav className="mb-2 flex flex-wrap items-center gap-1 text-xs text-text-muted">
          <Link href="/" className="hover:text-brand">
            Início
          </Link>
          {migalhas.map((m) => (
            <span key={m.label} className="flex items-center gap-1">
              <span>/</span>
              {m.href ? (
                <Link href={m.href} className="hover:text-brand">
                  {m.label}
                </Link>
              ) : (
                <span className="text-text">{m.label}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="font-display text-3xl font-black tracking-tight text-text md:text-4xl">
          {titulo}
        </h1>
        {descricao && (
          <p className="mt-2 max-w-2xl text-sm text-text-muted md:text-base">
            {descricao}
          </p>
        )}
      </div>
    </div>
  );
}
