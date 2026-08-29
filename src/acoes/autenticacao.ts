"use server";

import { redirect } from "next/navigation";
import { entrar, sair } from "@/lib/auth";
import { errosDoZod, esquemaLogin } from "@/lib/validacao";
import type { EstadoLogin } from "@/lib/estados-formulario";

export async function acaoEntrar(
  _anterior: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const analise = esquemaLogin.safeParse(Object.fromEntries(formData.entries()));
  if (!analise.success) {
    return { erros: errosDoZod(analise.error) };
  }

  const { email, senha, proximo } = analise.data;
  const sessao = await entrar(email, senha);

  if (!sessao) {
    return { erro: "E-mail ou senha incorretos." };
  }

  const destino = proximo && proximo.startsWith("/admin") ? proximo : "/admin";
  redirect(destino);
}

export async function acaoSair() {
  await sair();
  redirect("/admin/login");
}
