import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max: 1, // o Postgres local não aguenta conexões simultâneas
    connectionTimeoutMillis: 10_000,
    allowExitOnIdle: true,
  }),
});

const slug = (t: string) =>
  t
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const MARCAS = [
  "Mercedes-Benz",
  "Audi",
  "BMW",
  "Toyota",
  "Honda",
  "Volkswagen",
  "Chevrolet",
  "Ford",
  "Fiat",
  "Hyundai",
  "Jeep",
  "Nissan",
];

const OPCIONAIS: Array<[string, string]> = [
  ["Airbag", "Seguranca"],
  ["Freio ABS", "Seguranca"],
  ["Freios ABS com EBD", "Seguranca"],
  ["Controle de estabilidade", "Seguranca"],
  ["Controle de tração", "Seguranca"],
  ["Alarme", "Seguranca"],
  ["Alarme com acionamento a distância", "Seguranca"],
  ["Sensor de pressão dos pneus", "Seguranca"],
  ["Câmera de ré", "Seguranca"],
  ["Sensor de estacionamento", "Seguranca"],
  ["Ar condicionado", "Conforto"],
  ["Ar condicionado digital", "Conforto"],
  ["Travas elétricas", "Conforto"],
  ["Vidros elétricos", "Conforto"],
  ["Direção com Ajuste", "Conforto"],
  ["Bancos em couro", "Conforto"],
  ["Bancos elétricos", "Conforto"],
  ["Teto solar", "Conforto"],
  ["Teto solar panorâmico", "Conforto"],
  ["Ajuste retrovisor elétrico", "Conforto"],
  ["Volante multifuncional", "Conforto"],
  ["Computador de Bordo", "Tecnologia"],
  ["Chave Inteligente/Presencial", "Tecnologia"],
  ["Botão de Ignição/Start button", "Tecnologia"],
  ["Tela Multimídia", "Tecnologia"],
  ["Espelhamento com Smartphone", "Tecnologia"],
  ["Apple CarPlay", "Tecnologia"],
  ["Piloto automático", "Tecnologia"],
  ["USB", "Tecnologia"],
  ["Bluetooth", "Tecnologia"],
  ["Faróis de xenônio", "Externo"],
  ["Faróis Full LED", "Externo"],
  ["Rodas de liga leve", "Externo"],
  ["Rack de teto", "Externo"],
  ["Engate para reboque", "Externo"],
];

type SeedVeiculo = {
  /** pasta em public/estoque e slug da página do veículo */
  pasta: string;
  fotos: number;
  video?: boolean;
  marca: string;
  modelo: string;
  versao: string;
  anoFab: number;
  anoMod: number;
  /** em reais; 0 = ainda sem preço definido (fica como rascunho) */
  preco: number;
  /** valor da tabela FIPE, em reais — alimenta o bloco "Compare os preços" */
  fipe: number;
  /** código FIPE do modelo, para conferência futura */
  codigoFipe: string;
  km: number;
  cambio: "MANUAL" | "AUTOMATICO" | "AUTOMATIZADO" | "CVT";
  combustivel:
    | "FLEX"
    | "GASOLINA"
    | "ETANOL"
    | "DIESEL"
    | "GNV"
    | "HIBRIDO"
    | "ELETRICO";
  carroceria:
    | "HATCH"
    | "SEDA"
    | "SUV"
    | "PICAPE"
    | "COUPE"
    | "CONVERSIVEL"
    | "MINIVAN"
    | "PERUA"
    | "UTILITARIO";
  cor: string;
  portas: number;
  condicao: "NOVO" | "SEMINOVO" | "USADO";
  destaque?: boolean;
  revisoesEmDia?: boolean;
  descricao: string;
  opcionais: string[];
};

/** itens que consideramos seguros para qualquer um destes carros premium */
const BASE_PREMIUM = [
  "Airbag",
  "Freio ABS",
  "Freios ABS com EBD",
  "Controle de estabilidade",
  "Controle de tração",
  "Ar condicionado digital",
  "Travas elétricas",
  "Vidros elétricos",
  "Direção com Ajuste",
  "Ajuste retrovisor elétrico",
  "Volante multifuncional",
  "Computador de Bordo",
  "Bancos em couro",
  "Rodas de liga leve",
  "Bluetooth",
  "USB",
];

/**
 * Estoque real da loja. Os valores de FIPE foram consultados na tabela de
 * referência de agosto/2026 — reveja periodicamente, porque a FIPE muda todo mês.
 */
const VEICULOS: SeedVeiculo[] = [
  {
    pasta: "mercedes-benz-classe-c-180-coupe-2015",
    fotos: 7,
    marca: "Mercedes-Benz",
    modelo: "Classe C",
    versao: "C 180 CGI COUPÉ SPORT 1.6 TURBO 16V GASOLINA 2P AUTOMÁTICO",
    anoFab: 2014,
    anoMod: 2015,
    preco: 92_900,
    fipe: 92_753,
    codigoFipe: "021281-4",
    km: 87_000,
    cambio: "AUTOMATICO",
    combustivel: "GASOLINA",
    carroceria: "COUPE",
    cor: "Preto",
    portas: 2,
    condicao: "USADO",
    destaque: true,
    revisoesEmDia: true,
    descricao:
      "Mercedes-Benz C 180 Coupé preto, com preparo estético já feito: rodas AMG aro 18\", " +
      "capas de pinça AMG e difusor traseiro. Veículo revisado e pronto para uso.\n\n" +
      "Agende uma visita ou fale com um consultor para tirar dúvidas e combinar a avaliação do seu usado na troca.",
    opcionais: [
      ...BASE_PREMIUM,
      "Sensor de estacionamento",
      "Faróis de xenônio",
      "Alarme",
    ],
  },
  {
    pasta: "mercedes-benz-gla-250-enduro-2016",
    fotos: 11,
    marca: "Mercedes-Benz",
    modelo: "GLA",
    versao: "GLA 250 ENDURO 2.0 TURBO 16V 211CV GASOLINA 4P AUTOMÁTICO",
    anoFab: 2016,
    anoMod: 2016,
    preco: 114_000,
    fipe: 113_400,
    codigoFipe: "021339-0",
    km: 102_000,
    cambio: "AUTOMATICO",
    combustivel: "GASOLINA",
    carroceria: "SUV",
    cor: "Prata",
    portas: 4,
    condicao: "USADO",
    destaque: true,
    revisoesEmDia: true,
    descricao:
      "Mercedes-Benz GLA 250 Enduro prata, com rodas AMG aro 20\" e central multimídia de tela " +
      "grande com Apple CarPlay. Veículo revisado.\n\n" +
      "Agende uma visita ou fale com um consultor para tirar dúvidas e combinar a avaliação do seu usado na troca.",
    opcionais: [
      ...BASE_PREMIUM,
      "Tela Multimídia",
      "Apple CarPlay",
      "Espelhamento com Smartphone",
      "Câmera de ré",
      "Sensor de estacionamento",
      "Faróis de xenônio",
      "Alarme",
    ],
  },
  {
    pasta: "audi-a4-attraction-2017",
    fotos: 5,
    marca: "Audi",
    modelo: "A4",
    versao: "A4 ATTRACTION 2.0 TFSI 190CV GASOLINA 4P S TRONIC",
    anoFab: 2017,
    anoMod: 2017,
    preco: 93_648, // anunciado pelo valor da tabela FIPE
    fipe: 93_648,
    codigoFipe: "008208-2",
    km: 135_000,
    cambio: "AUTOMATICO",
    combustivel: "GASOLINA",
    carroceria: "SEDA",
    cor: "Branco",
    portas: 4,
    condicao: "USADO",
    descricao:
      "Audi A4 2.0 TFSI Attraction branco.\n\n" +
      "Agende uma visita ou fale com um consultor para tirar dúvidas e combinar a avaliação do seu usado na troca.",
    opcionais: [
      ...BASE_PREMIUM,
      "Tela Multimídia",
      "Sensor de estacionamento",
      "Faróis Full LED",
      "Alarme",
    ],
  },
  {
    pasta: "mercedes-benz-glk-300-4matic-2010",
    fotos: 17,
    video: true,
    marca: "Mercedes-Benz",
    modelo: "GLK",
    versao: "GLK 300 3.0 V6 24V 4X4 231CV GASOLINA 4P AUTOMÁTICO",
    anoFab: 2010,
    anoMod: 2010,
    preco: 71_736, // anunciado pelo valor da tabela FIPE
    fipe: 71_736,
    codigoFipe: "021228-8",
    km: 110_000,
    cambio: "AUTOMATICO",
    combustivel: "GASOLINA",
    carroceria: "SUV",
    cor: "Prata",
    portas: 4,
    condicao: "USADO",
    descricao:
      "Mercedes-Benz GLK 300 Sport 4MATIC prata, com teto solar panorâmico e rack de teto. " +
      "Tração integral 4MATIC e motor V6 3.0.\n\n" +
      "Agende uma visita ou fale com um consultor para tirar dúvidas e combinar a avaliação do seu usado na troca.",
    opcionais: [
      ...BASE_PREMIUM,
      "Teto solar panorâmico",
      "Rack de teto",
      "Sensor de estacionamento",
      "Faróis de xenônio",
      "Alarme",
    ],
  },
];

async function main() {
  console.log("→ limpando estoque anterior");
  await prisma.veiculoOpcional.deleteMany();
  await prisma.veiculoImagem.deleteMany();
  await prisma.favorito.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.veiculo.deleteMany();
  await prisma.modelo.deleteMany();
  await prisma.marca.deleteMany();
  await prisma.opcional.deleteMany();

  console.log("→ marcas");
  for (const [i, nome] of MARCAS.entries()) {
    await prisma.marca.upsert({
      where: { slug: slug(nome) },
      update: { ordem: i, destaque: i < 8 },
      create: { nome, slug: slug(nome), ordem: i, destaque: i < 8 },
    });
  }

  console.log("→ opcionais");
  for (const [nome, categoria] of OPCIONAIS) {
    await prisma.opcional.upsert({
      where: { slug: slug(nome) },
      update: { categoria },
      create: { nome, slug: slug(nome), categoria },
    });
  }

  console.log("→ veículos");
  for (const [i, v] of VEICULOS.entries()) {
    const marca = await prisma.marca.findUniqueOrThrow({
      where: { slug: slug(v.marca) },
    });
    const modelo = await prisma.modelo.upsert({
      where: { marcaId_slug: { marcaId: marca.id, slug: slug(v.modelo) } },
      update: {},
      create: { marcaId: marca.id, nome: v.modelo, slug: slug(v.modelo) },
    });

    const opcionais = await prisma.opcional.findMany({
      where: { slug: { in: v.opcionais.map(slug) } },
      select: { id: true },
    });

    const semPreco = v.preco <= 0;

    await prisma.veiculo.create({
      data: {
        slug: v.pasta,
        marcaId: marca.id,
        modeloId: modelo.id,
        versao: v.versao,
        anoFabricacao: v.anoFab,
        anoModelo: v.anoMod,
        precoCentavos: v.preco * 100,
        precoFipeCentavos: v.fipe > 0 ? v.fipe * 100 : null,
        quilometragem: v.km,
        cambio: v.cambio,
        combustivel: v.combustivel,
        carroceria: v.carroceria,
        condicao: v.condicao,
        cor: v.cor,
        portas: v.portas,
        aceitaTroca: true,
        revisoesEmDia: v.revisoesEmDia ?? false,
        descricao: v.descricao,
        videoUrl: v.video ? `/estoque/${v.pasta}/video.mp4` : null,
        cidade: "Juiz de Fora",
        estado: "MG",
        // sem preço definido o anúncio fica como rascunho, fora do site
        status: semPreco ? "RASCUNHO" : "DISPONIVEL",
        destaque: v.destaque ?? false,
        ordem: i,
        publicadoEm: semPreco ? null : new Date(),
        imagens: {
          create: Array.from({ length: v.fotos }, (_, n) => ({
            url: `/estoque/${v.pasta}/${String(n + 1).padStart(2, "0")}.jpg`,
            alt: `${v.marca} ${v.modelo} ${v.anoMod} ${v.cor} — foto ${n + 1}`,
            ordem: n,
            capa: n === 0,
          })),
        },
        opcionais: {
          create: opcionais.map((o) => ({ opcionalId: o.id })),
        },
      },
    });
  }

  console.log("→ usuário administrador");
  await prisma.usuario.upsert({
    where: { email: "admin@cwmotors.com.br" },
    update: {},
    create: {
      nome: "Administrador",
      email: "admin@cwmotors.com.br",
      senhaHash: await bcrypt.hash("cwmotors123", 10),
      papel: "ADMIN",
    },
  });

  console.log("→ configurações da loja");
  await prisma.configuracao.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      nomeLoja: "CW Motors",
      slogan: "Carros excepcionais. Experiência excepcional.",
      corPrimaria: "#E01F26",
      telefone: "(32) 3215-0198",
      whatsapp: "(32) 98811-2233",
      email: "contato@cwmotors.com.br",
      endereco: "Av. Barão do Rio Branco, 2500",
      cidade: "Juiz de Fora",
      estado: "MG",
      cep: "36013-020",
      horarioVendas: "Seg - Sáb: 9h às 19h",
      horarioServico: "Seg - Sex: 8h às 18h",
      instagram: "https://instagram.com/",
      facebook: "https://facebook.com/",
      youtube: "https://youtube.com/",
    },
  });

  const publicados = await prisma.veiculo.count({ where: { status: "DISPONIVEL" } });
  const rascunhos = await prisma.veiculo.count({ where: { status: "RASCUNHO" } });
  console.log(
    `\n✔ seed concluído — ${publicados} veículos publicados, ${rascunhos} em rascunho (sem preço)`,
  );
  console.log("  admin: admin@cwmotors.com.br / senha: cwmotors123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
