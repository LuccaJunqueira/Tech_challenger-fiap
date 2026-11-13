import { getBackendUrl } from "./backend-url";

const DEFAULT_TIMEOUT_MS = 5_000;

function getTimeoutMs(): number {
  const configured = Number(process.env.BACKEND_TIMEOUT_MS);
  return Number.isFinite(configured) && configured > 0
    ? configured
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
