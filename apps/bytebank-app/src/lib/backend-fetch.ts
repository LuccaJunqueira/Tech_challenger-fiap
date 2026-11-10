import { getBackendUrl } from "./backend-url";

const BACKEND_TIMEOUT_MS = 5_000;

export async function fetchBackend(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(`${getBackendUrl()}${path}`, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
  });
}
