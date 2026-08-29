import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { PapelUsuario } from "@/generated/prisma/enums";

export const COOKIE_SESSAO = "cw_sessao";
const DURACAO_DIAS = 7;

export type Sessao = {
  id: string;
  nome: string;
  email: string;
  papel: PapelUsuario;
};

function chave() {
  const segredo = process.env.AUTH_SECRET;
  if (!segredo || segredo.length < 32) {
    throw new Error(
      "AUTH_SECRET ausente ou muito curto. Defina uma chave de 32+ caracteres no .env",
    );
  }
  return new TextEncoder().encode(segredo);
}

export async function assinarSessao(sessao: Sessao) {
  return new SignJWT({ ...sessao })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_DIAS}d`)
    .sign(chave());
}

export async function lerToken(token: string): Promise<Sessao | null> {
  try {
    const { payload } = await jwtVerify(token, chave());
    if (!payload.id || !payload.email) return null;
    return {
      id: String(payload.id),
      nome: String(payload.nome ?? ""),
      email: String(payload.email),
      papel: payload.papel as PapelUsuario,
    };
  } catch {
    return null;
  }
}

export async function sessaoAtual(): Promise<Sessao | null> {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value;
  if (!token) return null;
  return lerToken(token);
}

export async function entrar(email: string, senha: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!usuario || !usuario.ativo) return null;

  const confere = await bcrypt.compare(senha, usuario.senhaHash);
  if (!confere) return null;

  const sessao: Sessao = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
  };
  const token = await assinarSessao(sessao);

  (await cookies()).set(COOKIE_SESSAO, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACAO_DIAS * 24 * 60 * 60,
  });

  return sessao;
}

export async function sair() {
  (await cookies()).delete(COOKIE_SESSAO);
}

export async function hashSenha(senha: string) {
  return bcrypt.hash(senha, 10);
}
