import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/** Leituras podem ser repetidas sem efeito colateral. */
const OPERACOES_DE_LEITURA = new Set([
  "findMany",
  "findFirst",
  "findFirstOrThrow",
  "findUnique",
  "findUniqueOrThrow",
  "count",
  "aggregate",
  "groupBy",
]);

/**
 * Postgres derruba conexões ociosas (o servidor local do Prisma e serviços como
 * Neon fazem isso). Quando o pool devolve um socket já fechado, o Prisma
 * responde com P1017 / "Server has closed the connection".
 */
function conexaoPerdida(erro: unknown) {
  if (!erro || typeof erro !== "object") return false;
  const codigo = (erro as { code?: string }).code;
  if (codigo === "P1017" || codigo === "ECONNRESET" || codigo === "EPIPE") {
    return true;
  }
  const mensagem = String((erro as { message?: string }).message ?? "");
  return (
    mensagem.includes("Server has closed the connection") ||
    mensagem.includes("Connection terminated") ||
    mensagem.includes("ConnectionClosed")
  );
}

/**
 * O Postgres local do `npx prisma dev` derruba conexões assim que recebe
 * algumas simultâneas (responde ECONNRESET), e fica mais sensível conforme o
 * servidor envelhece. Em desenvolvimento usamos uma única conexão — as
 * consultas entram em fila, o que é irrelevante numa máquina local. Em
 * produção, com um Postgres de verdade, o pool é normal.
 * Ajuste com DATABASE_POOL_MAX se precisar.
 */
function tamanhoDoPool() {
  const daEnv = Number(process.env.DATABASE_POOL_MAX);
  if (Number.isFinite(daEnv) && daEnv > 0) return Math.floor(daEnv);
  return process.env.NODE_ENV === "production" ? 10 : 1;
}

function criarCliente() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: tamanhoDoPool(),
    // recicla antes do servidor derrubar por conta própria
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    keepAlive: true,
  });

  // sem este ouvinte, um erro em conexão ociosa derruba o processo
  pool.on("error", (erro) => {
    console.warn("[prisma] conexão ociosa encerrada:", erro.message);
  });

  return new PrismaClient({
    adapter: new PrismaPg(pool),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  }).$extends({
    query: {
      async $allOperations({ operation, args, query }) {
        const podeRepetir = OPERACOES_DE_LEITURA.has(operation);
        const tentativas = podeRepetir ? 3 : 1;

        for (let n = 1; ; n++) {
          try {
            return await query(args);
          } catch (erro) {
            // cada falha faz o pool descartar o socket morto; a próxima
            // tentativa pega uma conexão nova. Só repetimos leituras, para
            // nunca reexecutar uma escrita.
            if (n >= tentativas || !conexaoPerdida(erro)) throw erro;
          }
        }
      },
    },
  });
}

type Cliente = ReturnType<typeof criarCliente>;

const globalForPrisma = globalThis as unknown as { prisma?: Cliente };

export const prisma = globalForPrisma.prisma ?? criarCliente();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
