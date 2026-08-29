-- CreateEnum
CREATE TYPE "Cambio" AS ENUM ('MANUAL', 'AUTOMATICO', 'AUTOMATIZADO', 'CVT');

-- CreateEnum
CREATE TYPE "Combustivel" AS ENUM ('FLEX', 'GASOLINA', 'ETANOL', 'DIESEL', 'GNV', 'HIBRIDO', 'ELETRICO');

-- CreateEnum
CREATE TYPE "Carroceria" AS ENUM ('HATCH', 'SEDA', 'SUV', 'PICAPE', 'COUPE', 'CONVERSIVEL', 'MINIVAN', 'PERUA', 'UTILITARIO');

-- CreateEnum
CREATE TYPE "Condicao" AS ENUM ('NOVO', 'SEMINOVO', 'USADO');

-- CreateEnum
CREATE TYPE "StatusVeiculo" AS ENUM ('RASCUNHO', 'DISPONIVEL', 'RESERVADO', 'VENDIDO');

-- CreateEnum
CREATE TYPE "StatusLead" AS ENUM ('NOVO', 'EM_ATENDIMENTO', 'NEGOCIANDO', 'CONVERTIDO', 'PERDIDO');

-- CreateEnum
CREATE TYPE "OrigemLead" AS ENUM ('DETALHE_VEICULO', 'CONTATO', 'FINANCIAMENTO', 'AVALIACAO_TROCA', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "PapelUsuario" AS ENUM ('ADMIN', 'VENDEDOR');

-- CreateTable
CREATE TABLE "marcas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marcas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modelos" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "modelos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opcionais" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'Conforto',

    CONSTRAINT "opcionais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veiculos" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "modeloId" TEXT NOT NULL,
    "versao" TEXT NOT NULL,
    "anoFabricacao" INTEGER NOT NULL,
    "anoModelo" INTEGER NOT NULL,
    "precoCentavos" INTEGER NOT NULL,
    "precoFipeCentavos" INTEGER,
    "precoMedioCentavos" INTEGER,
    "precoDeCentavos" INTEGER,
    "quilometragem" INTEGER NOT NULL DEFAULT 0,
    "cambio" "Cambio" NOT NULL,
    "combustivel" "Combustivel" NOT NULL,
    "carroceria" "Carroceria" NOT NULL,
    "condicao" "Condicao" NOT NULL DEFAULT 'USADO',
    "cor" TEXT NOT NULL,
    "portas" INTEGER NOT NULL DEFAULT 4,
    "finalPlaca" TEXT,
    "renavam" TEXT,
    "placa" TEXT,
    "blindado" BOOLEAN NOT NULL DEFAULT false,
    "aceitaTroca" BOOLEAN NOT NULL DEFAULT true,
    "unicoDono" BOOLEAN NOT NULL DEFAULT false,
    "ipvaPago" BOOLEAN NOT NULL DEFAULT false,
    "licenciado" BOOLEAN NOT NULL DEFAULT false,
    "garantiaFabrica" BOOLEAN NOT NULL DEFAULT false,
    "revisoesEmDia" BOOLEAN NOT NULL DEFAULT false,
    "descricao" TEXT NOT NULL DEFAULT '',
    "videoUrl" TEXT,
    "tour360Url" TEXT,
    "cidade" TEXT NOT NULL DEFAULT '',
    "estado" TEXT NOT NULL DEFAULT '',
    "status" "StatusVeiculo" NOT NULL DEFAULT 'RASCUNHO',
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "visitas" INTEGER NOT NULL DEFAULT 0,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "publicadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "veiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veiculo_imagens" (
    "id" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "capa" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "veiculo_imagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veiculo_opcionais" (
    "veiculoId" TEXT NOT NULL,
    "opcionalId" TEXT NOT NULL,

    CONSTRAINT "veiculo_opcionais_pkey" PRIMARY KEY ("veiculoId","opcionalId")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL DEFAULT '',
    "origem" "OrigemLead" NOT NULL DEFAULT 'DETALHE_VEICULO',
    "status" "StatusLead" NOT NULL DEFAULT 'NOVO',
    "aceitaContato" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT NOT NULL DEFAULT '',
    "veiculoId" TEXT,
    "cpf" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "entradaCentavos" INTEGER,
    "parcelas" INTEGER,
    "trocaPlaca" TEXT,
    "trocaMarca" TEXT,
    "trocaModelo" TEXT,
    "trocaAno" INTEGER,
    "trocaKm" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favoritos" (
    "id" TEXT NOT NULL,
    "visitante" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favoritos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" "PapelUsuario" NOT NULL DEFAULT 'VENDEDOR',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "nomeLoja" TEXT NOT NULL DEFAULT 'CW Motors',
    "slogan" TEXT NOT NULL DEFAULT '',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "corPrimaria" TEXT NOT NULL DEFAULT '#E01F26',
    "telefone" TEXT NOT NULL DEFAULT '',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "endereco" TEXT NOT NULL DEFAULT '',
    "cidade" TEXT NOT NULL DEFAULT '',
    "estado" TEXT NOT NULL DEFAULT '',
    "cep" TEXT NOT NULL DEFAULT '',
    "mapaUrl" TEXT NOT NULL DEFAULT '',
    "horarioVendas" TEXT NOT NULL DEFAULT 'Seg - Sáb: 9h às 19h',
    "horarioServico" TEXT NOT NULL DEFAULT 'Seg - Sex: 8h às 18h',
    "instagram" TEXT NOT NULL DEFAULT '',
    "facebook" TEXT NOT NULL DEFAULT '',
    "youtube" TEXT NOT NULL DEFAULT '',
    "tiktok" TEXT NOT NULL DEFAULT '',
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "marcas_nome_key" ON "marcas"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "marcas_slug_key" ON "marcas"("slug");

-- CreateIndex
CREATE INDEX "modelos_marcaId_idx" ON "modelos"("marcaId");

-- CreateIndex
CREATE UNIQUE INDEX "modelos_marcaId_slug_key" ON "modelos"("marcaId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "opcionais_nome_key" ON "opcionais"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "opcionais_slug_key" ON "opcionais"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "veiculos_slug_key" ON "veiculos"("slug");

-- CreateIndex
CREATE INDEX "veiculos_status_destaque_idx" ON "veiculos"("status", "destaque");

-- CreateIndex
CREATE INDEX "veiculos_marcaId_idx" ON "veiculos"("marcaId");

-- CreateIndex
CREATE INDEX "veiculos_modeloId_idx" ON "veiculos"("modeloId");

-- CreateIndex
CREATE INDEX "veiculos_precoCentavos_idx" ON "veiculos"("precoCentavos");

-- CreateIndex
CREATE INDEX "veiculos_anoModelo_idx" ON "veiculos"("anoModelo");

-- CreateIndex
CREATE INDEX "veiculo_imagens_veiculoId_ordem_idx" ON "veiculo_imagens"("veiculoId", "ordem");

-- CreateIndex
CREATE INDEX "leads_status_criadoEm_idx" ON "leads"("status", "criadoEm");

-- CreateIndex
CREATE INDEX "leads_veiculoId_idx" ON "leads"("veiculoId");

-- CreateIndex
CREATE UNIQUE INDEX "favoritos_visitante_veiculoId_key" ON "favoritos"("visitante", "veiculoId");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "modelos" ADD CONSTRAINT "modelos_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veiculos" ADD CONSTRAINT "veiculos_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veiculos" ADD CONSTRAINT "veiculos_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "modelos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veiculo_imagens" ADD CONSTRAINT "veiculo_imagens_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veiculo_opcionais" ADD CONSTRAINT "veiculo_opcionais_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veiculo_opcionais" ADD CONSTRAINT "veiculo_opcionais_opcionalId_fkey" FOREIGN KEY ("opcionalId") REFERENCES "opcionais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
