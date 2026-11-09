import {
  type AccountRepository,
  type AccountSnapshot,
  GetAccountOverview,
} from "@bytebank/core";

const snapshot: AccountSnapshot = {
  account: { id: "acc-1", type: "Debit", userId: "user-1" },
  cards: [],
  transactions: [
    { id: "t1", accountId: "acc-1", type: "Credit", value: 100, from: "Salário", date: new Date("2026-01-01T12:00:00Z") },
    { id: "t2", accountId: "acc-1", type: "Debit", value: -40, to: "Mercado", date: new Date("2026-01-02T12:00:00Z") },
  ],
};

describe("GetAccountOverview", () => {
  it("devolve o resumo calculado a partir do snapshot do repositório", async () => {
    const repo: AccountRepository = { getOverview: async () => snapshot };

    const overview = await new GetAccountOverview(repo).execute("qualquer-token");

    expect(overview?.summary.balance).toBe(60);
  });

  it("devolve null quando o repositório não encontra a conta", async () => {
    const repo: AccountRepository = { getOverview: async () => null };

    await expect(
      new GetAccountOverview(repo).execute("qualquer-token"),
    ).resolves.toBeNull();
  });
});