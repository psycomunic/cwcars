import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

const PADRAO = {
  id: "singleton",
  nomeLoja: "CW Motors",
  slogan: "Carros excepcionais. Experiência excepcional.",
  logoUrl: null as string | null,
  faviconUrl: null as string | null,
  corPrimaria: "#E01F26",
  telefone: "",
  whatsapp: "",
  email: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
  mapaUrl: "",
  horarioVendas: "Seg - Sáb: 9h às 19h",
  horarioServico: "Seg - Sex: 8h às 18h",
  instagram: "",
  facebook: "",
  youtube: "",
  tiktok: "",
  atualizadoEm: new Date(),
};

export type Configuracao = typeof PADRAO;

/** Configuração da loja. Cacheada por request. */
export const obterConfiguracao = cache(async (): Promise<Configuracao> => {
  try {
    const config = await prisma.configuracao.findUnique({
      where: { id: "singleton" },
    });
    return config ?? PADRAO;
  } catch {
    // banco indisponível: o site ainda renderiza com os valores padrão
    return PADRAO;
  }
});

export function linkWhatsapp(numero: string, mensagem: string) {
  const digitos = numero.replace(/\D/g, "");
  if (!digitos) return null;
  const comDdi = digitos.startsWith("55") ? digitos : `55${digitos}`;
  return `https://wa.me/${comDdi}?text=${encodeURIComponent(mensagem)}`;
}
