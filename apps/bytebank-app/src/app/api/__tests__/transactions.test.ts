/**
 * @jest-environment node
 */

jest.mock("@/lib/session", () => ({
  getSession: jest.fn(),
}));

jest.mock("@/lib/getAccountOverview", () => ({
  getAccountOverview: jest.fn(),
}));

import {
  type AccountOverview,
  BackendUnavailableError,
  UnauthorizedError,
} from "@bytebank/core";

import { getAccountOverview } from "@/lib/getAccountOverview";
import { getSession } from "@/lib/session";

import { DELETE, PUT } from "../transactions/[id]/route";
import { POST } from "../transactions/route";

const mockedGetSession = jest.mocked(getSession);
const mockedGetAccountOverview = jest.mocked(getAccountOverview);

const VALID_ID = "0123456789abcdef01234567";
const originalEnv = process.env;
const originalFetch = global.fetch;

function makeRequest(
  method: string,
  body?: unknown,
  origin = "http://localhost:3000",
) {
  return new Request("http://localhost:3001/api/transactions", {
    method,
    headers: { origin, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function params(id: string) {
  return { params: Promise.resolve({ id }) };
}

function overviewFor(ids: string[], accountId = "acc-real") {
  return {
    account: { id: accountId, type: "checking", userId: "user-1" },
    transactions: ids.map((id) => ({ id })),
    cards: [],
    summary: { totalIncome: 0, totalExpense: 0, balance: 0 },
    balanceHistory: [],
    distribution: [],
  } as unknown as AccountOverview;
}

function mockOverview(result: AccountOverview | null) {
  mockedGetAccountOverview.mockResolvedValue(result);
}

function mockOverviewError(error: Error) {
  mockedGetAccountOverview.mockRejectedValue(error);
}

describe("BFF de transações", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.INTERNAL_API_URL = "http://backend:3000";
    process.env.ALLOWED_ORIGINS = "http://localhost:3000";
    global.fetch = jest.fn();
    mockedGetSession.mockResolvedValue({ backendToken: "token-abc" } as never);
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it("POST usa o accountId da sessão, não o do corpo", async () => {
    mockOverview(overviewFor([], "acc-real"));
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        message: "ok",
        result: {
          id: "t-new",
          accountId: "acc-real",
          type: "Credit",
          value: 10,
          date: "2026-01-01T00:00:00.000Z",
        },
      }),
    });

    const response = await POST(
      makeRequest("POST", { accountId: "acc-fake", type: "Credit", value: 10 }),
    );

    expect(response.status).toBe(201);

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    const sent = JSON.parse((init as RequestInit).body as string);

    expect(url).toBe("http://backend:3000/account/transaction");
    expect(sent.accountId).toBe("acc-real");
    expect(sent.accountId).not.toBe("acc-fake");

    const body = await response.json();
    expect(body).toMatchObject({
      id: "t-new",
      accountId: "acc-real",
      date: "2026-01-01T00:00:00.000Z",
    });
    expect(body).not.toHaveProperty("result");
    expect(body).not.toHaveProperty("message");
  });

  it("POST rejeita urlAnexo sem https sem chamar o backend", async () => {
    const response = await POST(
      makeRequest("POST", {
        type: "Credit",
        value: 10,
        urlAnexo: "http://example.com/comprovante",
      }),
    );

    expect(response.status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it.each([0, -5, "abc"])(
    "POST rejeita value inválido (%s) sem chamar o backend",
    async (value) => {
      const response = await POST(
        makeRequest("POST", { type: "Credit", value }),
      );

      expect(response.status).toBe(400);
      expect(global.fetch).not.toHaveBeenCalled();
    },
  );

  it("POST rejeita origem inválida sem chamar o backend", async () => {
    const response = await POST(
      makeRequest(
        "POST",
        { type: "Credit", value: 10 },
        "https://evil.example",
      ),
    );

    expect(response.status).toBe(403);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("PUT de transação de outra conta devolve 404 sem mutar", async () => {
    mockOverview(overviewFor([]));

    const response = await PUT(
      makeRequest("PUT", { type: "Credit", value: 10 }),
      params(VALID_ID),
    );

    expect(response.status).toBe(404);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("PUT devolve 401 quando a credencial expirou", async () => {
    mockOverviewError(new UnauthorizedError());

    const response = await PUT(
      makeRequest("PUT", { type: "Credit", value: 10 }),
      params(VALID_ID),
    );

    expect(response.status).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("DELETE devolve 502 quando o backend está indisponível", async () => {
    mockOverviewError(new BackendUnavailableError());

    const response = await DELETE(makeRequest("DELETE"), params(VALID_ID));

    expect(response.status).toBe(502);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("PUT com ID inválido devolve 400 sem mutar", async () => {
    const response = await PUT(
      makeRequest("PUT", { type: "Credit", value: 10 }),
      params("abc"),
    );

    expect(response.status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("DELETE de transação de outra conta devolve 404 sem mutar", async () => {
    mockOverview(overviewFor([]));

    const response = await DELETE(makeRequest("DELETE"), params(VALID_ID));

    expect(response.status).toBe(404);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("DELETE com ID inválido devolve 400 sem mutar", async () => {
    const response = await DELETE(makeRequest("DELETE"), params("abc"));

    expect(response.status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("DELETE com sucesso devolve 204 sem corpo", async () => {
    mockOverview(overviewFor([VALID_ID]));
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => null,
    });

    const response = await DELETE(makeRequest("DELETE"), params(VALID_ID));

    expect(response.status).toBe(204);
    await expect(response.text()).resolves.toBe("");
    expect(global.fetch).toHaveBeenCalledWith(
      `http://backend:3000/account/transaction/${VALID_ID}`,
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("PUT com sucesso devolve a transação serializada (sem envelope)", async () => {
    mockOverview(overviewFor([VALID_ID]));
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        message: "ok",
        result: {
          id: VALID_ID,
          accountId: "acc-real",
          type: "Debit",
          value: -20,
          date: "2026-01-01T00:00:00.000Z",
        },
      }),
    });

    const response = await PUT(
      makeRequest("PUT", { type: "Debit", value: 20 }),
      params(VALID_ID),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      id: VALID_ID,
      accountId: "acc-real",
      type: "Debit",
      value: -20,
      date: "2026-01-01T00:00:00.000Z",
    });
    expect(body).not.toHaveProperty("result");
    expect(body).not.toHaveProperty("message");
    expect(global.fetch).toHaveBeenCalledWith(
      `http://backend:3000/account/transaction/${VALID_ID}`,
      expect.objectContaining({ method: "PUT" }),
    );
  });
});
