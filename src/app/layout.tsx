import "./globals.css";

import type { Metadata } from "next";
import { JetBrains_Mono, Sora } from "next/font/google";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ByteBank",
  description: "Gerencie suas transações financeiras",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${sora.variable} ${jetbrainsMono.variable}`}>
      <body className="w-full min-h-screen">

        {/* Skip link — invisível até receber foco */}
        <a
          href="#main-content"
          className="
            sr-only focus:not-sr-only
            focus:absolute focus:top-4 focus:left-4 focus:z-50
            focus:px-4 focus:py-2
            focus:bg-neon-cyan focus:text-bg-deep
            focus:rounded-pill focus:font-semibold
            focus:outline-none focus:ring-2 focus:ring-neon-cyan
          "
        >
          Pular para o conteúdo principal
        </a>

        {children}
      </body>
    </html>
  );
}
