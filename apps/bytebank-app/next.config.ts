import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@bytebank/ui"],
  // assetPrefix com path relativo para que assets da bytebank-app não conflitem
  // com os da bytebank-home. O host proxy tanto as rotas (/transactions/*) quanto
  // os assets (/transactions-static/*) para a bytebank-app.
  // Mesma origem (porta 3000) → sem CORS.
  assetPrefix: "/transactions-static",
};

export default nextConfig;
