import { filterTransactions, type Transaction } from "@bytebank/core";

const transaction: Transaction = {
  id: "t1",
  accountId: "acc-1",
  type: "Credit",
  value: 100,
  from: "Salário",
  date: new Date("2026-11-05T14:00:00Z"), // 11h em São Paulo, 14h em UTC
};

describe("filterTransactions: período personalizado", () => {
  it("sanidade: o processo de teste está em America/Sao_Paulo", () => {
    expect(new Date().getTimezoneOffset()).toBe(180);
  });

  // TODO(ponto 3): trocar por `it` quando o filtro de datas for corrigido.
  test.failing("inclui a transação do dia quando início e fim são o mesmo dia", () => {
    const result = filterTransactions([transaction], {
      period: "custom",
      startDate: "2026-11-05",
      endDate: "2026-11-05",
    });

    expect(result).toHaveLength(1);
  });
});