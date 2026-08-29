import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------- botões */

const VARIANTES = {
  primario:
    "bg-brand text-brand-contrast hover:bg-brand-hover focus-visible:outline-brand",
  escuro: "bg-ink text-text-invert hover:bg-ink-2 focus-visible:outline-ink",
  contorno:
    "border border-line bg-surface text-text hover:bg-surface-2 focus-visible:outline-ink",
  contornoClaro:
    "border border-white/35 bg-white/5 text-white hover:bg-white/15 focus-visible:outline-white",
  fantasma: "text-text hover:bg-surface-2 focus-visible:outline-ink",
  perigo: "bg-danger text-white hover:brightness-90 focus-visible:outline-danger",
} as const;

const TAMANHOS = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-[15px]",
} as const;

type BotaoBase = {
  variante?: keyof typeof VARIANTES;
  tamanho?: keyof typeof TAMANHOS;
  className?: string;
  children: ReactNode;
};

const baseBotao =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-semibold " +
  "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-55 cursor-pointer";

export function Botao({
  variante = "primario",
  tamanho = "md",
  className,
  ...props
}: BotaoBase & ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={cn(baseBotao, VARIANTES[variante], TAMANHOS[tamanho], className)}
    />
  );
}

export function BotaoLink({
  variante = "primario",
  tamanho = "md",
  className,
  ...props
}: BotaoBase & ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={cn(baseBotao, VARIANTES[variante], TAMANHOS[tamanho], className)}
    />
  );
}

/* -------------------------------------------------------------- selos */

const SELOS = {
  neutro: "bg-surface-3 text-text",
  escuro: "bg-ink text-text-invert",
  marca: "bg-brand text-brand-contrast",
  suave: "bg-brand-soft text-brand",
  sucesso: "bg-success/12 text-success",
  aviso: "bg-warning/14 text-warning",
  info: "bg-info/12 text-info",
  perigo: "bg-danger/12 text-danger",
} as const;

export function Selo({
  tom = "neutro",
  className,
  children,
}: {
  tom?: keyof typeof SELOS;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        SELOS[tom],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------- formulário */

const baseCampo =
  "w-full rounded-[var(--radius-sm)] border border-line bg-surface px-3.5 text-sm text-text " +
  "placeholder:text-text-muted transition-colors " +
  "focus:border-brand focus:outline-2 focus:outline-offset-0 focus:outline-brand/25 " +
  "disabled:bg-surface-2 disabled:text-text-muted";

export function Rotulo({
  className,
  obrigatorio,
  children,
  ...props
}: ComponentProps<"label"> & { obrigatorio?: boolean }) {
  return (
    <label
      {...props}
      className={cn("block text-[13px] font-medium text-text-muted", className)}
    >
      {children}
      {obrigatorio && <span className="text-brand"> *</span>}
    </label>
  );
}

export function Campo({ className, ...props }: ComponentProps<"input">) {
  return <input {...props} className={cn(baseCampo, "h-11", className)} />;
}

export function AreaTexto({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea {...props} className={cn(baseCampo, "min-h-28 py-2.5", className)} />
  );
}

export function Selecao({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      {...props}
      className={cn(
        baseCampo,
        "h-11 appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9",
        "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')]",
        className,
      )}
    />
  );
}

export function GrupoCampo({
  rotulo,
  obrigatorio,
  erro,
  ajuda,
  htmlFor,
  className,
  children,
}: {
  rotulo: string;
  obrigatorio?: boolean;
  erro?: string;
  ajuda?: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Rotulo htmlFor={htmlFor} obrigatorio={obrigatorio}>
        {rotulo}
      </Rotulo>
      {children}
      {erro ? (
        <p className="text-xs font-medium text-danger">{erro}</p>
      ) : ajuda ? (
        <p className="text-xs text-text-muted">{ajuda}</p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------- seções */

export function Secao({
  className,
  fundo = "claro",
  children,
}: {
  className?: string;
  fundo?: "claro" | "cinza" | "escuro";
  children: ReactNode;
}) {
  const fundos = {
    claro: "bg-surface",
    cinza: "bg-surface-2",
    escuro: "bg-ink text-text-invert",
  } as const;
  return (
    <section className={cn("py-14 md:py-18", fundos[fundo], className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}

export function TituloSecao({
  sobrenome,
  titulo,
  descricao,
  centralizado = true,
  invertido = false,
}: {
  sobrenome?: string;
  titulo: string;
  descricao?: string;
  centralizado?: boolean;
  invertido?: boolean;
}) {
  return (
    <div className={cn("mb-8", centralizado && "text-center")}>
      {sobrenome && <p className="eyebrow mb-2">{sobrenome}</p>}
      <h2
        className={cn(
          "text-2xl font-extrabold tracking-tight md:text-[34px]",
          invertido ? "text-text-invert" : "text-text",
        )}
      >
        {titulo}
      </h2>
      {descricao && (
        <p
          className={cn(
            "mx-auto mt-3 max-w-2xl text-sm md:text-base",
            invertido ? "text-white/70" : "text-text-muted",
          )}
        >
          {descricao}
        </p>
      )}
    </div>
  );
}

export function Vazio({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-line bg-surface-2 px-6 py-16 text-center">
      <h3 className="text-lg font-bold text-text">{titulo}</h3>
      {descricao && (
        <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">{descricao}</p>
      )}
      {acao && <div className="mt-6 flex justify-center">{acao}</div>}
    </div>
  );
}
