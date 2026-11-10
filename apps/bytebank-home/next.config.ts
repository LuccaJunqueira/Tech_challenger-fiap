import { APP_ZONE_ROUTES } from "@bytebank/types";
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

function buildHeaders() {
  return [
    ...securityHeaders,
    ...(process.env.NODE_ENV === "production"
      ? [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ]
      : []),
  ];
}

const nextConfig: NextConfig = {
  // Transpila o pacote compartilhado @bytebank/ui (contém JSX/TSX)
  transpilePackages: ["@bytebank/ui"],

  // Remove o header X-Powered-By
  poweredByHeader: false,

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

  async headers() {
    return [{ source: "/:path*", headers: buildHeaders() }];
  },
};

export default nextConfig;
