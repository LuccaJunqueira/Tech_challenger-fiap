import type { AccountOverviewDto } from "@bytebank/types";

import { apiSlice } from "../apiSlice";
import { makeStore } from "../index";
import {
  selectAccountOverview,
  selectTransactionHistory,
  selectTransactions,
} from "../selectors";
import { buildAccountPreloadedState } from "../serverSnapshot";

const overview: AccountOverviewDto = {
  account: { id: "acc-1", type: "checking", userId: "user-1" },
  transactions: [
    {
      id: "t-1",
      accountId: "acc-1",
      type: "Credit",
      value: 100,
      from: "ACME",
      date: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "t-2",
      accountId: "acc-1",
      type: "Debit",
      value: -40,
      to: "Loja",
      date: "2026-01-02T00:00:00.000Z",
    },
  ],
  cards: [],
  summary: { totalIncome: 100, totalExpense: -40, balance: 60 },
  balanceHistory: [{ date: "2026-01-01", balance: 100 }],
  distribution: [{ name: "Entradas", value: 100 }],
};

const originalFetch = global.fetch;

describe("seletores e snapshot do cache", () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("seletores memoizados devolvem a mesma referência para o mesmo estado", async () => {
    const store = makeStore();
    await store.dispatch(
      apiSlice.util.upsertQueryData("getAccount", undefined, overview),
    );

    const state = store.getState();

    expect(selectAccountOverview(state)).toEqual(overview);
    expect(selectTransactions(state)).toEqual(overview.transactions);
    expect(selectTransactionHistory(state)).toEqual(["ACME", "Loja"]);

    expect(selectTransactions(state)).toBe(selectTransactions(state));
    expect(selectTransactionHistory(state)).toBe(selectTransactionHistory(state));
  });

  it("snapshot hidrata a store sem nenhum fetch", async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock;

    const snapshot = await buildAccountPreloadedState(overview);
    const store = makeStore(snapshot);

    expect(selectAccountOverview(store.getState())).toEqual(overview);
    expect(selectTransactionHistory(store.getState())).toEqual([
      "ACME",
      "Loja",
    ]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
