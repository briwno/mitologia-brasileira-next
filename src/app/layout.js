import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ProvedoresAplicacao from "./providers";
import BarraNavegacaoGlobal from "@/components/UI/GlobalNav";
import { Analytics } from "@vercel/analytics/next"

const fonteGeistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fonteGeistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Ka'aguy",
  description: "Adentre a Ka'aguy. Se for capaz.",
};

// Layout raiz da aplicação
export default function LayoutPrincipal({ children }) {
  const versaoAplicacao = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0-alpha';
  return (
    <html lang="pt-BR">
      <body
        className={`${fonteGeistSans.variable} ${fonteGeistMono.variable} antialiased`}
      >
  <ProvedoresAplicacao>
    {children}
    <Analytics />
    <BarraNavegacaoGlobal />
  </ProvedoresAplicacao>
  {/* Marca d'água global com a versão */}
  <div className="fixed bottom-2 left-1/2 -translate-x-1/2 text-[11px] text-white/30 pointer-events-none select-none z-30">
    Versão: {versaoAplicacao}
  </div>
      </body>
    </html>
  );
}
