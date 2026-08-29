import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_SESSAO = "cw_sessao";

/**
 * Protege /admin. A verificação aqui é só da assinatura do JWT (roda no Edge,
 * sem acesso ao banco); a checagem de papel/usuário ativo é feita nas páginas.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get(COOKIE_SESSAO)?.value;
  const segredo = process.env.AUTH_SECRET;

  if (token && segredo) {
    try {
      await jwtVerify(token, new TextEncoder().encode(segredo));
      return NextResponse.next();
    } catch {
      // token inválido/expirado -> cai no redirect abaixo
    }
  }

  const destino = new URL("/admin/login", request.url);
  destino.searchParams.set("proximo", pathname);
  const resposta = NextResponse.redirect(destino);
  resposta.cookies.delete(COOKIE_SESSAO);
  return resposta;
}

export const config = {
  matcher: ["/admin/:path*"],
};
