import { NextResponse } from "next/server";
import { obterConfiguracao } from "@/lib/configuracao";
import {
  ehContexto,
  linkDoAtendente,
  mensagemDoContexto,
  proximoAtendente,
} from "@/lib/rodizio-whatsapp";

export const runtime = "nodejs";
/** Nunca cachear: cada visita tem de contar como um atendimento novo. */
export const dynamic = "force-dynamic";

/**
 * Para onde o botão de WhatsApp do site aponta.
 *
 * Os botões não levam mais direto ao `wa.me`: passam por aqui para o servidor
 * escolher de qual sócio é a vez e só então redirecionar. É o que divide os
 * leads entre os dois.
 *
 * Fica fora de `(site)` porque não é página: é um desvio, sem layout.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bruto = searchParams.get("ctx");
  const contexto = ehContexto(bruto) ? bruto : "geral";
  const referencia = searchParams.get("v");

  const [atendente, mensagem] = await Promise.all([
    proximoAtendente(),
    mensagemDoContexto(contexto, referencia),
  ]);

  // sem atendente cadastrado, cai no número da loja em Configurações; sem ele
  // também, volta para a página de contato em vez de deixar o clique no vazio
  const telefone = atendente?.telefone ?? (await obterConfiguracao()).whatsapp;
  const destino = telefone ? linkDoAtendente(telefone, mensagem) : null;

  const resposta = NextResponse.redirect(destino ?? new URL("/contato", request.url), {
    status: 307,
  });
  resposta.headers.set("Cache-Control", "no-store");
  return resposta;
}
