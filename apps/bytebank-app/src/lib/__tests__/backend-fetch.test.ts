/**
 * @jest-environment node
 */

import { fetchBackend } from "../backend-fetch";

const originalEnv = process.env;
const originalFetch = global.fetch;

function lastFetchInit(): RequestInit {
  const calls = (global.fetch as jest.Mock).mock.calls;
  return calls[calls.length - 1][1] as RequestInit;
}

describe("fetchBackend", () => {
  beforeEach(() => {
    process.env = {
      ...originalEnv,
      INTERNAL_API_URL: "http://backend:3000",
    };
    delete process.env.BACKEND_PROXY_SECRET;
    delete process.env.BACKEND_TIMEOUT_MS;
    global.fetch = jest
      .fn()
      .mockResolvedValue(new Response("{}")) as unknown as typeof fetch;
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it("envia x-bff-secret quando a variável existe", async () => {
    process.env.BACKEND_PROXY_SECRET = "segredo-de-teste";

    await fetchBackend("/account");

    const init = lastFetchInit();
    expect(new Headers(init.headers).get("x-bff-secret")).toBe(
      "segredo-de-teste",
    );
    expect(init.cache).toBe("no-store");
  });

  it("não envia o header quando a variável não existe (fora de produção)", async () => {
    await fetchBackend("/account");

    const init = lastFetchInit();
    expect(new Headers(init.headers).get("x-bff-secret")).toBeNull();
  });

  it("lança em produção sem BACKEND_PROXY_SECRET", async () => {
    const nodeEnv = process.env.NODE_ENV;
    process.env = { ...process.env, NODE_ENV: "production" };

    await expect(fetchBackend("/account")).rejects.toThrow(
      "BACKEND_PROXY_SECRET não configurada",
    );

    process.env = { ...process.env, NODE_ENV: nodeEnv };
  });
});
