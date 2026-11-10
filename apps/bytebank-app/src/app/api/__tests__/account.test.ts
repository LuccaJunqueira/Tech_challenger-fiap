/**
 * @jest-environment node
 */

jest.mock("@/lib/session", () => ({
  getSession: jest.fn(),
}));

jest.mock("@/composition/container", () => ({
  makeGetAccountOverview: jest.fn(),
}));

import type { AccountOverview } from "@bytebank/core";

import { makeGetAccountOverview } from "@/composition/container";
import { getSession } from "@/lib/session";

import { GET } from "../account/route";

const mockedGetSession = jest.mocked(getSession);
const mockedMakeGetAccountOverview = jest.mocked(makeGetAccountOverview);

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

function mockExecute(result: AccountOverview | null | Error) {
  const execute =
    result instanceof Error
      ? jest.fn().mockRejectedValue(result)
      : jest.fn().mockResolvedValue(result);

  mockedMakeGetAccountOverview.mockReturnValue({ execute } as never);

  return execute;
}

describe("GET /api/account", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetSession.mockResolvedValue({ backendToken: "token-abc" } as never);
  });

  it("devolve 401 sem backendToken e não chama o use case", async () => {
    mockedGetSession.mockResolvedValue({} as never);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(mockedMakeGetAccountOverview).not.toHaveBeenCalled();
  });

  it("devolve o DTO sanitizado com Cache-Control no-store", async () => {
    const execute = mockExecute(overview);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(execute).toHaveBeenCalledWith("token-abc");
    expect(Array.isArray(body.account)).toBe(false);
    expect(body.account).toEqual(overview.account);
    expect(body.cards[0].last4).toBe("1234");
    expect(body.cards[0]).not.toHaveProperty("cvc");
    expect(body.cards[0]).not.toHaveProperty("number");
    expect(body.transactions[0].date).toBe("2026-01-02T03:04:05.000Z");
  });

  it("devolve 502 quando o use case retorna null", async () => {
    mockExecute(null);

    const response = await GET();

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: "Falha ao carregar conta",
    });
  });

  it("devolve 502 genérico quando o use case lança", async () => {
    mockExecute(new Error("boom"));

    const response = await GET();

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: "Serviço indisponível",
    });
  });
});
