/**
 * @jest-environment node
 */

import { POST } from "../auth/register/route";

const originalEnv = process.env;
const originalFetch = global.fetch;

function makeRequest(body: unknown, origin = "http://localhost:3000") {
  return new Request("http://localhost:3001/api/auth/register", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.INTERNAL_API_URL = "http://backend:3000";
    process.env.ALLOWED_ORIGINS = "http://localhost:3000";
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it("rejeita origem inválida sem chamar o backend", async () => {
    const response = await POST(
      makeRequest(
        { username: "lucca", email: "a@b.com", password: "123456" },
        "https://evil.example",
      ),
    );

    expect(response.status).toBe(403);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it.each([
    {
      label: "sem password",
      body: { username: "lucca", email: "a@b.com" },
    },
    {
      label: "username curto",
      body: { username: "ab", email: "a@b.com", password: "123456" },
    },
    {
      label: "email inválido",
      body: { username: "lucca", email: "sem-arroba", password: "123456" },
    },
    {
      label: "password curto",
      body: { username: "lucca", email: "a@b.com", password: "123" },
    },
  ])("rejeita $label com 400", async ({ body }) => {
    const response = await POST(makeRequest(body));

    expect(response.status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("cadastra e não devolve a senha", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        message: "ok",
        result: {
          id: "user-1",
          username: "lucca",
          email: "a@b.com",
          password: "hash-secreto",
        },
      }),
    });

    const response = await POST(
      makeRequest({ username: "lucca", email: "a@b.com", password: "123456" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      user: { id: "user-1", username: "lucca", email: "a@b.com" },
    });
    expect(JSON.stringify(body)).not.toContain("hash-secreto");
  });

  it("devolve 502 genérico quando o backend falha", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "stack trace" }),
    });

    const response = await POST(
      makeRequest({ username: "lucca", email: "a@b.com", password: "123456" }),
    );

    expect(response.status).toBe(502);
    const body = await response.json();

    expect(body).toEqual({ error: "Falha ao cadastrar" });
    expect(JSON.stringify(body)).not.toContain("stack trace");
  });
});
