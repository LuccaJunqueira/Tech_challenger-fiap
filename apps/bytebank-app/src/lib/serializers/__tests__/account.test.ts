import type { AccountOverview } from "@bytebank/core";

import { toAccountOverviewDto } from "../account";

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
      last4: "9876",
      dueDate: "2030-01-01",
      functions: "credit",
      paymentDate: "2026-01-01",
      name: "Cartão",
      number: "4111111111119876",
      cvc: "321",
    },
  ],
  summary: { totalIncome: 100, totalExpense: 0, balance: 100 },
  balanceHistory: [{ date: "2026-01-02T03:04:05.000Z", balance: 100 }],
  distribution: [
    { name: "Entradas", value: 100 },
    { name: "Saídas", value: 0 },
  ],
} as unknown as AccountOverview;

describe("toAccountOverviewDto", () => {
  it("remove number e cvc e mantém apenas last4", () => {
    const dto = toAccountOverviewDto(overview);

    expect(dto.cards[0].last4).toBe("9876");
    expect(dto.cards[0]).not.toHaveProperty("number");
    expect(dto.cards[0]).not.toHaveProperty("cvc");
    expect(JSON.stringify(dto.cards)).not.toContain("4111111111119876");
    expect(JSON.stringify(dto.cards)).not.toContain("321");
  });

  it("serializa a data da transação como ISO string", () => {
    const dto = toAccountOverviewDto(overview);

    expect(dto.transactions[0].date).toBe("2026-01-02T03:04:05.000Z");
  });

  it("mantém account como objeto e não como array", () => {
    const dto = toAccountOverviewDto(overview);

    expect(Array.isArray(dto.account)).toBe(false);
    expect(dto.account).toEqual({
      id: "acc-1",
      type: "checking",
      userId: "user-1",
    });
  });

  it("preserva summary, balanceHistory e distribution", () => {
    const dto = toAccountOverviewDto(overview);

    expect(dto.summary).toEqual(overview.summary);
    expect(dto.balanceHistory).toEqual(overview.balanceHistory);
    expect(dto.distribution).toEqual(overview.distribution);
  });

  it("devolve account null quando não há conta", () => {
    const dto = toAccountOverviewDto({
      ...overview,
      account: null,
    });

    expect(dto.account).toBeNull();
  });
});
