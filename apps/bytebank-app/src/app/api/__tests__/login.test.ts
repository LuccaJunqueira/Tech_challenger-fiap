/**
 * @jest-environment node
 */

jest.mock("@/lib/session", () => ({
  getSession: jest.fn(),
}));

import { getSession } from "@/lib/session";

import { POST } from "../auth/login/route";

const mockedGetSession = jest.mocked(getSession);
const originalEnv = process.env;
const originalFetch = global.fetch;

function makeRequest(body: unknown, origin = "http://localhost:3000") {
  return new Request("http://localhost:3001/api/auth/login", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.INTERNAL_API_URL = "http://backend:3000";
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it("rejeita origem inválida sem chamar o backend", async () => {
    const response = await POST(
      makeRequest(
        { email: "a@b.com", password: "123456" },
        "https://evil.example",
      ),
    );

    expect(response.status).toBe(403);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("rejeita senha ausente sem chamar o backend", async () => {
    process.env.ALLOWED_ORIGINS = "http://localhost:3000";

    const response = await POST(makeRequest({ email: "a@b.com" }));

    expect(response.status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("cria a sessão, chama save e não devolve o token", async () => {
    process.env.ALLOWED_ORIGINS = "http://localhost:3000";
    const save = jest.fn().mockResolvedValue(undefined);
    const session = { backendToken: undefined as string | undefined, save };
    mockedGetSession.mockResolvedValue(session as never);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ message: "ok", result: { token: "jwt-secreto" } }),
    });

    const response = await POST(
      makeRequest({ email: "a@b.com", password: "123456" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ authenticated: true });
    expect(JSON.stringify(body)).not.toContain("jwt-secreto");
    expect(session.backendToken).toBe("jwt-secreto");
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("devolve 502 quando o backend falha", async () => {
    process.env.ALLOWED_ORIGINS = "http://localhost:3000";
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "stack trace" }),
    });

    const response = await POST(
      makeRequest({ email: "a@b.com", password: "123456" }),
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: "Serviço indisponível",
    });
  });
});
