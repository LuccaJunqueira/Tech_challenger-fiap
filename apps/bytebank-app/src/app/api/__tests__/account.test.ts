/**
 * @jest-environment node
 */

jest.mock("@/lib/getAccountOverview", () => ({
  getAccountOverview: jest.fn(),
}));

import { type AccountOverview,UnauthorizedError } from "@bytebank/core";

import { getAccountOverview } from "@/lib/getAccountOverview";

import { GET } from "../account/route";

const mockedGetAccountOverview = jest.mocked(getAccountOverview);

const overview = {
  account: { id: "acc-1", type: "checking", userId: "user-1" },
  transactions: [
    {
      id: "t1",
      accountId: "acc-1",
      type: "Credit",
      value: 100,
      from: "Alice",
      to: "Bob",
      attachmentName: "recibo.pdf",
      attachmentUrl: "https://example.com/recibo.pdf",
      date: new Date("2026-01-02T03:04:05.000Z"),
    },
  ],
  cards: [
    {
      id: "card-1",
      accountId: "acc-1",
      type: "credit",
      isBlocked: false,
      last4: "1234",
      dueDate: "2030-01-01",
      functions: "credit",
      paymentDate: "2026-01-01",
      name: "Cartão",
      number: "4111111111111234",
      cvc: "999",
    },
  ],
  summary: { totalIncome: 100, totalExpense: 0, balance: 100 },
  balanceHistory: [{ date: "2026-01-02T03:04:05.000Z", balance: 100 }],
  distribution: [
    { name: "Entradas", value: 100 },
    { name: "Saídas", value: 0 },
  ],
} as unknown as AccountOverview;

function mockOverview(result: AccountOverview | null | Error) {
  if (result instanceof Error) {
    mockedGetAccountOverview.mockRejectedValue(result);
    return;
  }

  mockedGetAccountOverview.mockResolvedValue(result);
}

describe("GET /api/account", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devolve 401 quando a credencial está ausente ou foi rejeitada", async () => {
    mockOverview(new UnauthorizedError());

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Não autenticado",
    });
  });

  it("devolve o DTO sanitizado com Cache-Control no-store", async () => {
    mockOverview(overview);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(mockedGetAccountOverview).toHaveBeenCalledWith();
    expect(Array.isArray(body.account)).toBe(false);
    expect(body.account).toEqual(overview.account);
    expect(body.cards[0].last4).toBe("1234");
    expect(body.cards[0]).not.toHaveProperty("cvc");
    expect(body.cards[0]).not.toHaveProperty("number");
    expect(body.transactions[0].date).toBe("2026-01-02T03:04:05.000Z");
  });

  it("devolve 502 quando o use case retorna null", async () => {
    mockOverview(null);

    const response = await GET();

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: "Falha ao carregar conta",
    });
  });

  it("devolve 502 genérico quando o use case lança", async () => {
    mockOverview(new Error("boom"));

    const response = await GET();

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: "Serviço indisponível",
    });
  });
});
