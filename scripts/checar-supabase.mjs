/**
 * Confere se a conexão com o Supabase está de pé antes de migrar o projeto.
 * Uso: npm run supabase:check
 */
import "dotenv/config";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

const ok = (t) => console.log(`  [32mOK[0m    ${t}`);
const falha = (t) => console.log(`  [31mFALHA[0m ${t}`);
const pular = (t) => console.log(`  [33m--[0m    ${t}`);

let problemas = 0;

async function testarConexao(rotulo, url) {
  if (!url) {
    pular(`${rotulo}: não definida`);
    return;
  }
  if (url.includes("[SENHA]") || url.includes("[REGIAO]")) {
    falha(`${rotulo}: ainda tem placeholder ([SENHA] ou [REGIAO]) na string`);
    problemas++;
    return;
  }

  const cliente = new pg.Client({
    connectionString: url,
    connectionTimeoutMillis: 15_000,
  });
  try {
    await cliente.connect();
    const { rows } = await cliente.query(
      "select current_database() as banco, version() as versao",
    );
    ok(`${rotulo}: conectado em "${rows[0].banco}"`);
    const tabelas = await cliente.query(
      "select count(*)::int n from information_schema.tables where table_schema = 'public'",
    );
    console.log(`        ${tabelas.rows[0].n} tabelas no schema public`);
  } catch (e) {
    falha(`${rotulo}: ${e.message}`);
    problemas++;
  } finally {
    await cliente.end().catch(() => {});
  }
}

async function testarStorage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "veiculos";

  if (!url || !chave) {
    pular("Storage: SUPABASE_SERVICE_ROLE_KEY vazia (uploads vão para public/uploads)");
    return;
  }

  try {
    const supabase = createClient(url, chave, { auth: { persistSession: false } });
    const { data, error } = await supabase.storage.listBuckets();
    if (error) throw new Error(error.message);

    const achado = data.find((b) => b.name === bucket);
    if (!achado) {
      falha(
        `Storage: bucket "${bucket}" não existe. Buckets disponíveis: ${
          data.map((b) => b.name).join(", ") || "(nenhum)"
        }`,
      );
      problemas++;
      return;
    }
    ok(`Storage: bucket "${bucket}" encontrado${achado.public ? " (público)" : ""}`);
    if (!achado.public) {
      falha(`        o bucket precisa ser público para as fotos aparecerem no site`);
      problemas++;
    }
  } catch (e) {
    falha(`Storage: ${e.message}`);
    problemas++;
  }
}

console.log("\nConferindo a configuração do Supabase\n");
await testarConexao("DATABASE_URL  (app, via pooler)", process.env.DATABASE_URL);
await testarConexao("DIRECT_URL    (migrations)", process.env.DIRECT_URL);
await testarStorage();

console.log(
  problemas === 0
    ? "\n[32mTudo certo.[0m Pode rodar: npx prisma migrate deploy\n"
    : `\n[31m${problemas} problema(s)[0m — veja acima.\n`,
);
process.exit(problemas === 0 ? 0 : 1);
