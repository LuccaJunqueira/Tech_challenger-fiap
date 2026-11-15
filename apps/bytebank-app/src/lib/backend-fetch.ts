import { getBackendUrl } from "./backend-url";

const DEFAULT_TIMEOUT_MS = 5_000;

/**
 * O Render free hiberna e leva ~30-60 s para acordar. Em produção o timeout
 * precisa cobrir o cold start; caso contrário o primeiro login falha com 502
 * mesmo que o backend ficasse pronto logo depois.
 *
 * Medido em 15/11/2026: `GET /health` no Render levou 32,4 s para responder.
 * O valor precisa ficar abaixo do `maxDuration` das rotas do BFF (60 s).
 */
const PRODUCTION_TIMEOUT_MS = 45_000;

function getTimeoutMs(): number {
  const configured = Number(process.env.BACKEND_TIMEOUT_MS);
  if (Number.isFinite(configured) && configured > 0) return configured;

  return process.env.NODE_ENV === "production"
    ? PRODUCTION_TIMEOUT_MS
    : DEFAULT_TIMEOUT_MS;
}

export async function fetchBackend(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const secret = process.env.BACKEND_PROXY_SECRET;

  if (secret) {
    headers.set("x-bff-secret", secret);
  } else if (process.env.NODE_ENV === "production") {
    throw new Error("BACKEND_PROXY_SECRET não configurada");
  }

  return fetch(`${getBackendUrl()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(getTimeoutMs()),
  });
}
