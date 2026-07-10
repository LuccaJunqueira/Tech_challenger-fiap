import type { AccountState } from "@bytebank/types";
import { createSlice } from "@reduxjs/toolkit";

import { apiSlice } from "./apiSlice";

const initialState: AccountState = {
  accounts: [],
  transactions: [],
  cards: [],
  loading: false,
  error: null,
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    setAccountLoading: (state, action) => {
      state.loading = action.payload;
    },

    setAccountError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },

  extraReducers: (builder) => {
    builder.addMatcher(
      apiSlice.endpoints.getAccount.matchPending,
      (state) => {
        state.loading = true;
        state.error = null;
      },
    );

    builder.addMatcher(
      apiSlice.endpoints.getAccount.matchFulfilled,
      (state, { payload }) => {
        state.accounts = payload.account;
        state.transactions = payload.transactions;
        state.cards = payload.cards;
        state.loading = false;
        state.error = null;
      },
    );

    builder.addMatcher(
      apiSlice.endpoints.getAccount.matchRejected,
      (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ?? "Falha ao carregar dados da conta.";
      },
    );
  },
});

export const {
  setAccountLoading,
  setAccountError,
} = accountSlice.actions;

export const selectAccountData = (state: { account: AccountState }) =>
  state.account;
export const selectAccountLoading = (state: { account: AccountState }) =>
  state.account.loading;
export const selectAccountError = (state: { account: AccountState }) =>
  state.account.error;

export default accountSlice.reducer;
