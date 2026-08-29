/** Rótulos em PT-BR para os enums do Prisma. */

export const CAMBIO = {
  MANUAL: "Manual",
  AUTOMATICO: "Automático",
  AUTOMATIZADO: "Automatizado",
  CVT: "CVT",
} as const;

export const COMBUSTIVEL = {
  FLEX: "Gasolina e álcool",
  GASOLINA: "Gasolina",
  ETANOL: "Etanol",
  DIESEL: "Diesel",
  GNV: "GNV",
  HIBRIDO: "Híbrido",
  ELETRICO: "Elétrico",
} as const;

export const CARROCERIA = {
  HATCH: "Hatch",
  SEDA: "Sedã",
  SUV: "SUV",
  PICAPE: "Picape",
  COUPE: "Coupé",
  CONVERSIVEL: "Conversível",
  MINIVAN: "Minivan",
  PERUA: "Perua",
  UTILITARIO: "Utilitário",
} as const;

export const CONDICAO = {
  NOVO: "Novo",
  SEMINOVO: "Seminovo",
  USADO: "Usado",
} as const;

export const STATUS_VEICULO = {
  RASCUNHO: "Rascunho",
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
} as const;

export const STATUS_LEAD = {
  NOVO: "Novo",
  EM_ATENDIMENTO: "Em atendimento",
  NEGOCIANDO: "Negociando",
  CONVERTIDO: "Convertido",
  PERDIDO: "Perdido",
} as const;

export const ORIGEM_LEAD = {
  DETALHE_VEICULO: "Página do veículo",
  CONTATO: "Formulário de contato",
  FINANCIAMENTO: "Simulação de financiamento",
  AVALIACAO_TROCA: "Avaliação de troca",
  WHATSAPP: "WhatsApp",
} as const;

export const PAPEL_USUARIO = {
  ADMIN: "Administrador",
  VENDEDOR: "Vendedor",
} as const;

export const opcoes = <T extends Record<string, string>>(mapa: T) =>
  Object.entries(mapa).map(([value, label]) => ({ value, label }));
