-- CreateEnum
CREATE TYPE "CategoriaDespesa" AS ENUM ('DOCUMENTACAO', 'MECANICA', 'FUNILARIA', 'ESTETICA', 'TRANSPORTE', 'COMISSAO_COMPRA', 'OUTROS');

-- AlterTable
ALTER TABLE "veiculos" ADD COLUMN     "custoAquisicaoCentavos" INTEGER;

-- CreateTable
CREATE TABLE "despesas_veiculo" (
    "id" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" "CategoriaDespesa" NOT NULL DEFAULT 'OUTROS',
    "valorCentavos" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "despesas_veiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendas" (
    "id" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "comissaoCentavos" INTEGER NOT NULL DEFAULT 0,
    "vendidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "compradorNome" TEXT NOT NULL,
    "compradorTelefone" TEXT NOT NULL DEFAULT '',
    "formaPagamento" TEXT NOT NULL DEFAULT '',
    "observacoes" TEXT NOT NULL DEFAULT '',
    "leadId" TEXT,
    "vendedorId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "despesas_veiculo_veiculoId_idx" ON "despesas_veiculo"("veiculoId");

-- CreateIndex
CREATE INDEX "despesas_veiculo_data_idx" ON "despesas_veiculo"("data");

-- CreateIndex
CREATE UNIQUE INDEX "vendas_veiculoId_key" ON "vendas"("veiculoId");

-- CreateIndex
CREATE UNIQUE INDEX "vendas_leadId_key" ON "vendas"("leadId");

-- CreateIndex
CREATE INDEX "vendas_vendidoEm_idx" ON "vendas"("vendidoEm");

-- CreateIndex
CREATE INDEX "vendas_vendedorId_idx" ON "vendas"("vendedorId");

-- AddForeignKey
ALTER TABLE "despesas_veiculo" ADD CONSTRAINT "despesas_veiculo_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despesas_veiculo" ADD CONSTRAINT "despesas_veiculo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

