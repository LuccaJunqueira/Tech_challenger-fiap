import { APP_ZONE_ROUTES } from "@bytebank/types";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpila o pacote compartilhado @bytebank/ui (contém JSX/TSX)
  transpilePackages: ["@bytebank/ui"],

  async rewrites() {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
    return [
      // Rotas da bytebank-app
      ...APP_ZONE_ROUTES.map((route) => ({
        source: `${route}/:path*`,
        destination: `${base}${route}/:path*`,
      })),
      // Assets da bytebank-app (prefixo separado para não conflitar com rotas)
      {
        source: "/transactions-static/:path*",
        destination: `${base}/transactions-static/:path*`,
      },
    ];
  },
};

export default nextConfig;
