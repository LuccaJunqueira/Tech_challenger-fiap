import { createSelector } from "@reduxjs/toolkit";

import { apiSlice } from "./apiSlice";
import type { RootState } from "./index";

const selectAccountQuery = (state: RootState) =>
  apiSlice.endpoints.getAccount.select()(state);

export const selectAccountOverview = (state: RootState) =>
  selectAccountQuery(state).data;

export const selectTransactions = createSelector(
  [selectAccountOverview],
  (overview) => overview?.transactions ?? [],
);

export const selectTransactionHistory = createSelector(
  [selectTransactions],
  (transactions) =>
    transactions.flatMap((t) =>
      [t.from, t.to].filter((value): value is string => Boolean(value?.trim())),
    ),
);

export const selectAccountStatus = createSelector(
  [selectAccountQuery],
  (q) => ({
    isLoading: q.isLoading,
    isFetching: q.status === "pending",
    error: q.error,
  }),
);
