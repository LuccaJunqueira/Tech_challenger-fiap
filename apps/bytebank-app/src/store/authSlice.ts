import type { AuthState, User } from "@bytebank/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

import { apiSlice } from "./apiSlice";
import { getJwtCookieOptions,JWT_COOKIE_NAME } from "./constants";

// ANTES: initialState lia do localStorage (exclusivo navegador, inacessível em SSR)
// DEPOIS: lê do cookie via js-cookie, acessível tanto no cliente quanto no servidor
const initialState: AuthState = {
  token:
    typeof window !== "undefined" ? (Cookies.get(JWT_COOKIE_NAME) ?? null) : null,
  user: null,
  isAuthenticated:
    typeof window !== "undefined" ? !!Cookies.get(JWT_COOKIE_NAME) : false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user?: User | null }>,
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user ?? null;
      state.isAuthenticated = true;
      // ANTES: localStorage.setItem("jwt_token", token)
      // DEPOIS: cookie via js-cookie — necessário para SSR e Multizones
      if (typeof window !== "undefined") {
        Cookies.set(JWT_COOKIE_NAME, action.payload.token, getJwtCookieOptions());
      }
    },

    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      // ANTES: localStorage.removeItem("jwt_token")
      // DEPOIS: remove o cookie — Server Components também perdem o acesso
      if (typeof window !== "undefined") {
        Cookies.remove(JWT_COOKIE_NAME, { path: "/" });
      }
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
      (state, { payload }) => {
        state.token = payload.token;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
        // ANTES: localStorage.setItem("jwt_token", payload.token)
        // DEPOIS: cookie — mesma justificativa de SSR/Multizones
        if (typeof window !== "undefined") {
          Cookies.set(JWT_COOKIE_NAME, payload.token, getJwtCookieOptions());
        }
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

export const { setCredentials, logout, setAuthLoading, setAuthError } =
  authSlice.actions;

export const selectCurrentToken = (state: { auth: AuthState }) =>
  state.auth.token;
export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) =>
  state.auth.error;

export default authSlice.reducer;
