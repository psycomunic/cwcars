/**
 * Em JavaScript, e não TypeScript, de propósito.
 *
 * O servidor de build da Hostinger roda glibc anterior à 2.29, e o binário
 * nativo do Next 16 exige 2.29+. Sem ele, o Next cai no SWC em WebAssembly —
 * que consegue compilar a aplicação, mas quebra ao transpilar um
 * `next.config.ts` (gera um import para um arquivo que não existe). Um config
 * já em JS não precisa de transpilação nenhuma e passa nos dois ambientes.
 */

/**
 * Libera o otimizador de imagens para o Storage do Supabase.
 * Sem isso, fotos hospedadas lá seriam servidas em tamanho original.
 */
function hostDoSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const host = hostDoSupabase();

/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: host
      ? [
          {
            protocol: "https",
            hostname: host,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
