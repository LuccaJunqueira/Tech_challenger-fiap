import type { AuthState } from "@bytebank/types";
import { createSlice } from "@reduxjs/toolkit";

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

export const { setAuthenticated, logout } = authSlice.actions;

export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;

export default authSlice.reducer;
