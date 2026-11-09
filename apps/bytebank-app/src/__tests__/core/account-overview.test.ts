import { buildAccountOverview, filterTransactions } from "@bytebank/core";

const snapshot = {
  account: { id: "acc-1", type: "checking", userId: "user-1" },
  cards: [],
  transactions: [
    {
      id: "t1",
      accountId: "acc-1",
      type: "Credit" as const,
      value: 100,
      from: "Salário",
      date: new Date("2026-01-01T12:00:00Z"),
    },
    {
      id: "t2",
      accountId: "acc-1",
      type: "Debit" as const,
      value: -40,
      to: "Mercado",
      date: new Date("2026-01-02T12:00:00Z"),
    },
  ],
};

describe("buildAccountOverview", () => {
  it("calcula totais e saldo", () => {
    const overview = buildAccountOverview(snapshot);

    expect(overview.summary.totalIncome).toBe(100);
    expect(overview.summary.totalExpense).toBe(-40);
    expect(overview.summary.balance).toBe(60);
  });

  it("ordena o histórico por data", () => {
    const overview = buildAccountOverview(snapshot);

    expect(overview.balanceHistory.map((p) => p.balance)).toEqual([100, 60]);
  });
});

describe("filterTransactions", () => {
  it("filtra por tipo", () => {
    const result = filterTransactions(snapshot.transactions, { type: "Debit" });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("t2");
  });

  it("busca em from e to", () => {
    expect(
      filterTransactions(snapshot.transactions, { query: "mercado" }),
    ).toHaveLength(1);
  });
});
