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

const privateCacheHeaders = [
  { key: "Cache-Control", value: "private, no-store" },
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
  transpilePackages: ["@bytebank/ui", "@bytebank/core"],
  // assetPrefix com path relativo para que assets da bytebank-app não conflitem
  // com os da bytebank-home. O host proxy tanto as rotas (/transactions/*) quanto
  // os assets (/transactions-static/*) para a bytebank-app.
  // Mesma origem (porta 3000) → sem CORS.
  assetPrefix: "/transactions-static",

  // Remove o header X-Powered-By
  poweredByHeader: false,

  async headers() {
    return [
      { source: "/:path*", headers: buildHeaders() },
      { source: "/transactions", headers: privateCacheHeaders },
      { source: "/transactions/:path*", headers: privateCacheHeaders },
      { source: "/api/:path*", headers: privateCacheHeaders },
    ];
  },
};

export default nextConfig;
