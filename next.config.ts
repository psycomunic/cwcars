import type { NextConfig } from "next";

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

const nextConfig: NextConfig = {
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
