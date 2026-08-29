/**
 * Tipos e valores padrão do formulário de veículo do painel.
 * Fica fora do componente "use client" para poder ser usado também
 * pelos Server Components que montam a página.
 */

export type Imagem = { url: string; alt: string };

export type DadosFormularioVeiculo = {
  id?: string;
  marcaId: string;
  modeloId: string;
  versao: string;
  anoFabricacao: number;
  anoModelo: number;
  preco: string;
  precoDe: string;
  precoFipe: string;
  precoMedio: string;
  quilometragem: number;
  cambio: string;
  combustivel: string;
  carroceria: string;
  condicao: string;
  status: string;
  cor: string;
  portas: number;
  finalPlaca: string;
  placa: string;
  renavam: string;
  blindado: boolean;
  aceitaTroca: boolean;
  unicoDono: boolean;
  ipvaPago: boolean;
  licenciado: boolean;
  garantiaFabrica: boolean;
  revisoesEmDia: boolean;
  destaque: boolean;
  descricao: string;
  videoUrl: string;
  tour360Url: string;
  cidade: string;
  estado: string;
  ordem: number;
  imagens: Imagem[];
  opcionais: string[];
};

export const VEICULO_EM_BRANCO: DadosFormularioVeiculo = {
  marcaId: "",
  modeloId: "",
  versao: "",
  anoFabricacao: new Date().getFullYear(),
  anoModelo: new Date().getFullYear(),
  preco: "",
  precoDe: "",
  precoFipe: "",
  precoMedio: "",
  quilometragem: 0,
  cambio: "AUTOMATICO",
  combustivel: "FLEX",
  carroceria: "SUV",
  condicao: "SEMINOVO",
  status: "DISPONIVEL",
  cor: "",
  portas: 4,
  finalPlaca: "",
  placa: "",
  renavam: "",
  blindado: false,
  aceitaTroca: true,
  unicoDono: false,
  ipvaPago: false,
  licenciado: false,
  garantiaFabrica: false,
  revisoesEmDia: false,
  destaque: false,
  descricao: "",
  videoUrl: "",
  tour360Url: "",
  cidade: "",
  estado: "",
  ordem: 0,
  imagens: [],
  opcionais: [],
};
