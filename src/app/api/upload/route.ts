import { NextResponse } from "next/server";
import { sessaoAtual } from "@/lib/auth";
import { guardarArquivo } from "@/lib/armazenamento";

export const runtime = "nodejs";

const TIPOS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/svg+xml": ".svg",
};

const TAMANHO_MAXIMO = 8 * 1024 * 1024; // 8 MB por arquivo

/**
 * Recebe as fotos do painel. O destino (disco local ou Supabase Storage) é
 * decidido em `src/lib/armazenamento.ts` conforme as variáveis de ambiente.
 */
export async function POST(request: Request) {
  const sessao = await sessaoAtual();
  if (!sessao) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const formData = await request.formData();
  const arquivos = formData.getAll("arquivos").filter((a) => a instanceof File);

  if (arquivos.length === 0) {
    return NextResponse.json({ erro: "Nenhum arquivo enviado" }, { status: 400 });
  }

  const urls: string[] = [];

  for (const arquivo of arquivos) {
    const extensao = TIPOS[arquivo.type];
    if (!extensao) {
      return NextResponse.json(
        { erro: `Formato não suportado: ${arquivo.type || "desconhecido"}` },
        { status: 415 },
      );
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      return NextResponse.json(
        { erro: `"${arquivo.name}" passa de 8 MB.` },
        { status: 413 },
      );
    }

    try {
      const url = await guardarArquivo({
        nome: arquivo.name,
        tipo: arquivo.type,
        extensao,
        bytes: Buffer.from(await arquivo.arrayBuffer()),
      });
      urls.push(url);
    } catch (erro) {
      console.error("Falha ao guardar arquivo", erro);
      return NextResponse.json(
        {
          erro:
            erro instanceof Error
              ? erro.message
              : "Não foi possível guardar o arquivo.",
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ urls });
}
