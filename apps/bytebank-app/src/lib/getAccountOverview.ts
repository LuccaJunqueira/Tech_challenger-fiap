import { cache } from "react";

import { makeGetAccountOverview } from "@/composition/container";

/**
 * Sem argumentos de propósito: `cache()` deduplica por argumento.
 * A garantia de uma única chamada a GET /account por request (V6) depende
 * desta assinatura vazia. Não passe token aqui: a credencial é resolvida
 * pela infraestrutura, via CredentialProvider.
 */
export const getAccountOverview = cache(async () =>
  makeGetAccountOverview().execute(),
);
