import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import "./globals.css";
import { urlDoSite } from "@/lib/site-url";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: urlDoSite(),
  title: {
    default: "CW Motors — Carros novos e seminovos",
    template: "%s | CW Motors",
  },
  description:
    "Estoque selecionado de carros novos e seminovos com procedência, garantia e financiamento facilitado.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "CW Motors",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-surface">{children}</body>
    </html>
  );
}
