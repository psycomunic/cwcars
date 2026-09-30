/**
 * Quem pode fazer o quê no painel.
 *
 * O campo `papel` existia desde o começo, mas era só um rótulo na tela: nenhuma
 * tela ou ação conferia. Um vendedor conseguia mexer nas configurações da loja
 * e excluir veículos. Aqui a regra fica num lugar só, para a tela esconder e a
 * ação recusar pelo mesmo critério — esconder o botão não protege nada sozinho.
 *
 * Sem `server-only` de propósito: a barra lateral é client component e precisa
 * da mesma regra para decidir o que mostrar.
 */

export const PAPEIS = ["ADMIN", "VENDEDOR"] as const;
export type Papel = (typeof PAPEIS)[number];

/**
 * VENDEDOR cuida do dia a dia: veículos e leads. ADMIN cuida do que muda a
 * loja inteira — usuários, configurações, catálogo de marcas e exclusões.
 */
const PERMISSOES = {
  gerenciarUsuarios: ["ADMIN"],
  alterarConfiguracoes: ["ADMIN"],
  gerenciarCatalogo: ["ADMIN"],
  excluirVeiculo: ["ADMIN"],
  verFinanceiro: ["ADMIN"],
  gerenciarVeiculos: ["ADMIN", "VENDEDOR"],
  gerenciarLeads: ["ADMIN", "VENDEDOR"],
} as const satisfies Record<string, readonly Papel[]>;

export type Permissao = keyof typeof PERMISSOES;

export function pode(papel: string | null | undefined, permissao: Permissao) {
  if (!papel) return false;
  return (PERMISSOES[permissao] as readonly string[]).includes(papel);
}

/** Rótulo do papel para exibição. */
export const NOME_DO_PAPEL: Record<Papel, string> = {
  ADMIN: "Administrador",
  VENDEDOR: "Vendedor",
};

/** O que cada papel alcança, em uma frase, para explicar na tela. */
export const RESUMO_DO_PAPEL: Record<Papel, string> = {
  ADMIN: "Acesso total, incluindo usuários, configurações e financeiro.",
  VENDEDOR: "Cadastra e edita veículos e atende leads. Não mexe no resto.",
};
