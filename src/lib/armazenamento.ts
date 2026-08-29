import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

/**
 * Onde as fotos enviadas pelo painel são gravadas.
 *
 * - **Supabase Storage** quando SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY estão
 *   definidos. É o modo obrigatório em hospedagem com disco efêmero
 *   (Vercel e afins), onde arquivos salvos em disco somem no próximo deploy.
 * - **Disco local** (`public/uploads`) caso contrário, para o desenvolvimento
 *   funcionar sem depender de nuvem.
 */

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "veiculos";

export function usandoSupabase() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/** Host público do Supabase, usado para liberar o next/image. */
export function hostDoSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

function cliente() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) {
    throw new Error(
      "Supabase Storage não configurado: faltam NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  // a service_role ignora RLS; por isso este módulo é server-only
  return createClient(url, chave, { auth: { persistSession: false } });
}

export type ArquivoEnviado = {
  nome: string;
  tipo: string;
  bytes: Buffer;
  extensao: string;
};

/** Grava um arquivo e devolve a URL pública. */
export async function guardarArquivo(arquivo: ArquivoEnviado): Promise<string> {
  const nome = `${randomUUID()}${arquivo.extensao}`;

  if (usandoSupabase()) {
    const supabase = cliente();
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(nome, arquivo.bytes, {
        contentType: arquivo.tipo,
        cacheControl: "31536000",
        upsert: false,
      });

    if (error) {
      throw new Error(`Falha ao enviar para o Supabase Storage: ${error.message}`);
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(nome);
    return data.publicUrl;
  }

  const destino = path.join(process.cwd(), "public", "uploads");
  await mkdir(destino, { recursive: true });
  await writeFile(path.join(destino, nome), arquivo.bytes);
  return `/uploads/${nome}`;
}
