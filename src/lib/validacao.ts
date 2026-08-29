import { z } from "zod";

const nome = z
  .string()
  .trim()
  .min(3, "Informe seu nome completo")
  .max(120, "Nome muito longo");

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Informe seu e-mail")
  .email("E-mail inválido");

const telefone = z
  .string()
  .trim()
  .min(1, "Informe seu telefone")
  .refine((v) => {
    const d = v.replace(/\D/g, "");
    return d.length === 10 || d.length === 11;
  }, "Telefone inválido — use DDD + número");

const opcional = (max = 500) => z.string().trim().max(max).optional().default("");

/** Lead vindo da página do veículo ou do formulário de contato. */
export const esquemaLead = z.object({
  nome,
  email,
  telefone,
  mensagem: opcional(1500),
  veiculoId: z.string().trim().optional(),
  origem: z
    .enum(["DETALHE_VEICULO", "CONTATO", "FINANCIAMENTO", "AVALIACAO_TROCA", "WHATSAPP"])
    .default("DETALHE_VEICULO"),
  aceitaContato: z
    .union([z.literal("on"), z.literal("true"), z.literal("")])
    .optional()
    .transform((v) => v === "on" || v === "true"),
});

/** Simulação de financiamento. */
export const esquemaFinanciamento = z.object({
  nome,
  email,
  telefone,
  cpf: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, "").length === 11, "CPF inválido"),
  dataNascimento: z
    .string()
    .trim()
    .refine((v) => !Number.isNaN(Date.parse(v)), "Data de nascimento inválida"),
  entrada: opcional(20),
  parcelas: z.coerce.number().int().min(6).max(60).default(48),
  veiculoId: z.string().trim().optional(),
  mensagem: opcional(1000),
  aceitaContato: z
    .union([z.literal("on"), z.literal("true"), z.literal("")])
    .optional()
    .transform((v) => v === "on" || v === "true"),
});

/** Avaliação do veículo usado do cliente. */
export const esquemaTroca = z.object({
  nome,
  email,
  telefone,
  trocaPlaca: z.string().trim().min(7, "Informe a placa").max(8),
  trocaMarca: z.string().trim().min(2, "Informe a marca"),
  trocaModelo: z.string().trim().min(1, "Informe o modelo"),
  trocaAno: z.coerce
    .number()
    .int()
    .min(1950, "Ano inválido")
    .max(new Date().getFullYear() + 1, "Ano inválido"),
  trocaKm: z.coerce.number().int().min(0).max(2_000_000),
  mensagem: opcional(1000),
  aceitaContato: z
    .union([z.literal("on"), z.literal("true"), z.literal("")])
    .optional()
    .transform((v) => v === "on" || v === "true"),
});

/** Login do painel administrativo. */
export const esquemaLogin = z.object({
  email,
  senha: z.string().min(6, "Senha muito curta"),
  proximo: z.string().trim().optional(),
});

export type DadosLead = z.infer<typeof esquemaLead>;
export type DadosFinanciamento = z.infer<typeof esquemaFinanciamento>;
export type DadosTroca = z.infer<typeof esquemaTroca>;

/** Converte os erros do zod no formato usado pelos formulários. */
export function errosDoZod(erro: z.ZodError): Record<string, string> {
  const saida: Record<string, string> = {};
  for (const issue of erro.issues) {
    const chave = String(issue.path[0] ?? "_");
    if (!saida[chave]) saida[chave] = issue.message;
  }
  return saida;
}
