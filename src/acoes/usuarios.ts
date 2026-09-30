"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { exigirPermissao, exigirSessao, hashSenha } from "@/lib/auth";
import { errosDoZod } from "@/lib/validacao";
import { PAPEIS } from "@/lib/permissoes";
import type { EstadoFormulario } from "@/lib/estados-formulario";

const SENHA_MINIMA = 8;

const esquemaNovoUsuario = z.object({
  nome: z.string().trim().min(2, "Informe o nome").max(80),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  senha: z
    .string()
    .min(SENHA_MINIMA, `A senha precisa de ao menos ${SENHA_MINIMA} caracteres`)
    .max(200),
  papel: z.enum(PAPEIS),
});

/**
 * Quantos administradores ativos restariam se este usuário saísse de cena.
 *
 * Existe para impedir o painel de ficar sem nenhum administrador — o que
 * deixaria a loja sem quem cria usuários, e sem saída a não ser SQL no banco.
 */
async function sobrariaAdmin(idQueSai: string) {
  const restantes = await prisma.usuario.count({
    where: { papel: "ADMIN", ativo: true, id: { not: idQueSai } },
  });
  return restantes > 0;
}

function atualizar() {
  revalidatePath("/admin/usuarios");
}

export async function criarUsuario(
  _anterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await exigirPermissao("gerenciarUsuarios");

  const dados = esquemaNovoUsuario.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    senha: formData.get("senha"),
    papel: formData.get("papel"),
  });

  if (!dados.success) return { ok: false, erros: errosDoZod(dados.error) };

  const existe = await prisma.usuario.findUnique({
    where: { email: dados.data.email },
    select: { id: true },
  });
  if (existe) {
    return { ok: false, erros: { email: "Já existe um usuário com este e-mail" } };
  }

  await prisma.usuario.create({
    data: {
      nome: dados.data.nome,
      email: dados.data.email,
      senhaHash: await hashSenha(dados.data.senha),
      papel: dados.data.papel,
    },
  });

  atualizar();
  return { ok: true, mensagem: `${dados.data.nome} agora tem acesso ao painel.` };
}

export async function alterarPapel(formData: FormData) {
  const sessao = await exigirPermissao("gerenciarUsuarios");

  const id = String(formData.get("id") ?? "");
  const papel = String(formData.get("papel") ?? "");
  if (!id || !PAPEIS.includes(papel as (typeof PAPEIS)[number])) return;

  // rebaixar o último administrador deixaria o painel sem quem o administre
  if (papel !== "ADMIN" && !(await sobrariaAdmin(id))) return;

  await prisma.usuario
    .update({
      where: { id },
      data: { papel: papel as (typeof PAPEIS)[number] },
    })
    .catch(() => null);

  atualizar();
  // o papel vai dentro do JWT: quem mudou a si mesmo precisa de sessão nova
  if (id === sessao.id) revalidatePath("/admin", "layout");
}

export async function alternarAtivo(formData: FormData) {
  const sessao = await exigirPermissao("gerenciarUsuarios");

  const id = String(formData.get("id") ?? "");
  if (!id || id === sessao.id) return; // ninguém se desativa

  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: { ativo: true },
  });
  if (!usuario) return;

  if (usuario.ativo && !(await sobrariaAdmin(id))) return;

  await prisma.usuario
    .update({ where: { id }, data: { ativo: !usuario.ativo } })
    .catch(() => null);

  atualizar();
}

export async function excluirUsuario(formData: FormData) {
  const sessao = await exigirPermissao("gerenciarUsuarios");

  const id = String(formData.get("id") ?? "");
  if (!id || id === sessao.id) return; // ninguém se exclui
  if (!(await sobrariaAdmin(id))) return;

  await prisma.usuario.delete({ where: { id } }).catch(() => null);
  atualizar();
}

const esquemaNovaSenha = z.object({
  id: z.string().min(1),
  senha: z
    .string()
    .min(SENHA_MINIMA, `A senha precisa de ao menos ${SENHA_MINIMA} caracteres`)
    .max(200),
});

/** Administrador define a senha de outra pessoa. */
export async function definirSenha(
  _anterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await exigirPermissao("gerenciarUsuarios");

  const dados = esquemaNovaSenha.safeParse({
    id: formData.get("id"),
    senha: formData.get("senha"),
  });
  if (!dados.success) return { ok: false, erros: errosDoZod(dados.error) };

  await prisma.usuario
    .update({
      where: { id: dados.data.id },
      data: { senhaHash: await hashSenha(dados.data.senha) },
    })
    .catch(() => null);

  atualizar();
  return { ok: true, mensagem: "Senha alterada." };
}

const esquemaMinhaSenha = z
  .object({
    atual: z.string().min(1, "Informe a senha atual"),
    nova: z
      .string()
      .min(SENHA_MINIMA, `A nova senha precisa de ao menos ${SENHA_MINIMA} caracteres`)
      .max(200),
    confirmacao: z.string(),
  })
  .refine((d) => d.nova === d.confirmacao, {
    path: ["confirmacao"],
    message: "A confirmação não bate com a nova senha",
  });

/**
 * Qualquer pessoa troca a própria senha — inclusive vendedor, que não tem
 * permissão de gerenciar usuários. Por isso pede só sessão, e exige a senha
 * atual: sem isso, um computador destravado vira uma conta sequestrada.
 */
export async function trocarMinhaSenha(
  _anterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const sessao = await exigirSessao();

  const dados = esquemaMinhaSenha.safeParse({
    atual: formData.get("atual"),
    nova: formData.get("nova"),
    confirmacao: formData.get("confirmacao"),
  });
  if (!dados.success) return { ok: false, erros: errosDoZod(dados.error) };

  const bcrypt = (await import("bcryptjs")).default;
  const usuario = await prisma.usuario.findUnique({
    where: { id: sessao.id },
    select: { senhaHash: true },
  });
  if (!usuario) return { ok: false, mensagem: "Usuário não encontrado." };

  if (!(await bcrypt.compare(dados.data.atual, usuario.senhaHash))) {
    return { ok: false, erros: { atual: "Senha atual incorreta" } };
  }

  await prisma.usuario.update({
    where: { id: sessao.id },
    data: { senhaHash: await hashSenha(dados.data.nova) },
  });

  atualizar();
  return { ok: true, mensagem: "Sua senha foi alterada." };
}
