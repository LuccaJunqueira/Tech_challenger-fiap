/**
 * @jest-environment node
 */

import type { AccountOverviewDto } from "@bytebank/types";

import { apiSlice } from "../apiSlice";
import { logout } from "../authSlice";
import { makeStore } from "../index";

// O fetchBaseQuery monta URLs relativas ("/api/..."): no browser elas são
// resolvidas pelo document, no Node precisam de uma base absoluta.
const NativeRequest = global.Request;
global.Request = class extends NativeRequest {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    super(
      typeof input === "string" && input.startsWith("/")
        ? `http://localhost:3001${input}`
        : input,
      init,
    );
  }
} as typeof Request;

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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function requestUrl(input: RequestInfo | URL) {
  return input instanceof Request ? input.url : String(input);
}

describe("apiSlice — cache e reautenticação", () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("logout + resetApiState limpa o cache", async () => {
    const store = makeStore();

    await store.dispatch(
      apiSlice.util.upsertQueryData("getAccount", undefined, overview),
    );

    expect(Object.keys(store.getState().api.queries)).toHaveLength(1);

    store.dispatch(logout());
    store.dispatch(apiSlice.util.resetApiState());

    expect(Object.keys(store.getState().api.queries)).toHaveLength(0);
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });

  it("401 desautentica e limpa o cache", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(jsonResponse({ error: "Não autenticado" }, 401));

    const store = makeStore();

    const subscription = store.dispatch(
      apiSlice.endpoints.getAccount.initiate(),
    );
    await subscription;

    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(Object.keys(store.getState().api.queries)).toHaveLength(0);

    subscription.unsubscribe();
  });

  it("mutação invalida a tag Account e refaz o getAccount", async () => {
    const fetchMock = jest
      .fn()
      .mockImplementation((input: RequestInfo | URL) =>
        Promise.resolve(
          requestUrl(input).includes("/api/transactions")
            ? jsonResponse(
                {
                  id: "t-3",
                  accountId: "acc-1",
                  type: "Credit",
                  value: 25,
                  date: "2026-01-03T00:00:00.000Z",
                },
                201,
              )
            : jsonResponse(overview),
        ),
      );
    global.fetch = fetchMock;

    const store = makeStore();
    const subscription = store.dispatch(
      apiSlice.endpoints.getAccount.initiate(),
    );
    await subscription;

    const accountCallsBefore = fetchMock.mock.calls.filter(([input]) =>
      requestUrl(input).includes("/api/account"),
    ).length;

    await store.dispatch(
      apiSlice.endpoints.createTransaction.initiate({
        type: "Credit",
        value: 25,
      }),
    );

    const accountCallsAfter = fetchMock.mock.calls.filter(([input]) =>
      requestUrl(input).includes("/api/account"),
    ).length;

    expect(store.getState().api.provided.tags.Account).toBeDefined();
    expect(accountCallsAfter).toBeGreaterThan(accountCallsBefore);

    subscription.unsubscribe();
    store.dispatch(apiSlice.util.resetApiState());
  });
});
