import type { AuthState } from "@bytebank/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { apiSlice } from "./apiSlice";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated: (state) => {
      state.isAuthenticated = true;
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },

    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder.addMatcher(
      apiSlice.endpoints.login.matchPending,
      (state) => {
        state.loading = true;
        state.error = null;
      },
    );

    builder.addMatcher(
      apiSlice.endpoints.login.matchFulfilled,
      (state) => {
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      },
    );

    builder.addMatcher(
      apiSlice.endpoints.login.matchRejected,
      (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Falha ao fazer login";
      },
    );
  },
});

export const { setAuthenticated, logout, setAuthLoading, setAuthError } =
  authSlice.actions;

export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) =>
  state.auth.error;

export default authSlice.reducer;
