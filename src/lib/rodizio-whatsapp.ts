import "server-only";
import { prisma } from "@/lib/prisma";
import { obterConfiguracao } from "@/lib/configuracao";

/**
 * Rodízio dos WhatsApp dos sócios.
 *
 * O rodízio é **global**, não por visitante: o primeiro clique do dia vai para
 * um sócio, o próximo para o outro, venham do mesmo navegador ou não. Por isso
 * a contagem fica no banco — guardá-la no navegador faria cada visitante
 * alternar sozinho e, no fim, os dois sócios receberiam o mesmo primeiro
 * clique de cada pessoa.
 *
 * A escolha é sempre "quem atendeu menos". Isso é melhor que um contador com
 * resto de divisão: quando um sócio entra, sai ou fica um tempo desativado, a
 * fila se reequilibra sozinha, sem ninguém ficar para trás.
 */

export type AtendenteEscolhido = {
  id: string;
  nome: string;
  telefone: string;
};

/**
 * Escolhe o próximo atendente e já contabiliza o atendimento.
 *
 * Vai em uma instrução só, de propósito. Dois cliques ao mesmo tempo poderiam
 * ler a mesma menor contagem e cair no mesmo sócio; `FOR UPDATE SKIP LOCKED`
 * faz o segundo clique pular a linha travada e pegar o próximo da fila.
 */
export async function proximoAtendente(): Promise<AtendenteEscolhido | null> {
  const linhas = await prisma.$queryRaw<AtendenteEscolhido[]>`
    UPDATE atendentes_whatsapp
    SET atendimentos = atendimentos + 1
    WHERE id = (
      SELECT id FROM atendentes_whatsapp
      WHERE ativo = true
      ORDER BY atendimentos ASC, ordem ASC, id ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    RETURNING id, nome, telefone
  `;

  return linhas[0] ?? null;
}

/** Só lê a fila, sem contabilizar. Para a tela de configurações. */
export async function listarAtendentes() {
  return prisma.atendenteWhatsapp.findMany({
    orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
  });
}

/**
 * Contextos de onde o botão foi clicado. A mensagem é montada aqui, no
 * servidor, e não vem pronta na URL: assim ninguém monta um link do site que
 * abre o WhatsApp da loja com um texto qualquer.
 */
export const CONTEXTOS = ["geral", "contato", "veiculo"] as const;
export type Contexto = (typeof CONTEXTOS)[number];

export function ehContexto(valor: string | null): valor is Contexto {
  return !!valor && (CONTEXTOS as readonly string[]).includes(valor);
}

export async function mensagemDoContexto(
  contexto: Contexto,
  referencia?: string | null,
) {
  const { nomeLoja } = await obterConfiguracao();

  if (contexto === "veiculo" && referencia) {
    const veiculo = await prisma.veiculo.findUnique({
      where: { slug: referencia },
      select: {
        anoModelo: true,
        marca: { select: { nome: true } },
        modelo: { select: { nome: true } },
      },
    });
    if (veiculo) {
      const nome = `${veiculo.marca.nome} ${veiculo.modelo.nome} ${veiculo.anoModelo}`;
      return `Olá! Vi o ${nome} no site da ${nomeLoja} e gostaria de mais informações.`;
    }
  }

  if (contexto === "contato") {
    return `Olá! Vim pelo site da ${nomeLoja} e gostaria de falar com um consultor.`;
  }

  return `Olá! Vim pelo site da ${nomeLoja} e gostaria de mais informações.`;
}

/** Monta o link do WhatsApp a partir de um telefone brasileiro. */
export function linkDoAtendente(telefone: string, mensagem: string) {
  const digitos = telefone.replace(/\D/g, "");
  if (!digitos) return null;
  const comDdi = digitos.startsWith("55") ? digitos : `55${digitos}`;
  return `https://wa.me/${comDdi}?text=${encodeURIComponent(mensagem)}`;
}
