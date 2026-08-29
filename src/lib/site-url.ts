/**
 * Endereço público do site, usado em metadata (OpenGraph, canonical…).
 *
 * A ordem existe porque cada ambiente sabe de uma coisa diferente:
 * 1. NEXT_PUBLIC_SITE_URL — o domínio real, quando já está configurado;
 * 2. VERCEL_PROJECT_PRODUCTION_URL — o domínio de produção da Vercel, injetado
 *    automaticamente no build, para o deploy funcionar antes de existir domínio;
 * 3. localhost, no desenvolvimento.
 *
 * Variável de ambiente vazia conta como ausente: a Vercel cria a chave sem
 * valor quando ela é declarada e não preenchida, e `??` deixaria a string vazia
 * passar direto para `new URL("")`, que lança ERR_INVALID_URL e derruba o build.
 */
function primeiraPreenchida(...valores: (string | undefined)[]) {
  for (const valor of valores) {
    const limpo = valor?.trim();
    if (limpo) return limpo;
  }
  return undefined;
}

export function urlDoSite(): URL {
  const bruta = primeiraPreenchida(
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  );

  if (!bruta) return new URL("http://localhost:3000");

  // a Vercel entrega o domínio sem protocolo
  const comProtocolo = /^https?:\/\//.test(bruta) ? bruta : `https://${bruta}`;

  try {
    return new URL(comProtocolo);
  } catch {
    console.warn(`[site] NEXT_PUBLIC_SITE_URL inválida: "${bruta}"`);
    return new URL("http://localhost:3000");
  }
}
