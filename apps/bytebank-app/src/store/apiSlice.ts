import type {
  CreateTransactionRequest,
  CreateTransactionResponse,
  CreateTransactionResult,
  CreateUserRequest,
  CreateUserResponse,
  CreateUserResult,
  DeleteTransactionResult,
  GetAccountResponse,
  GetAccountResult,
  GetStatementResponse,
  GetStatementResult,
  LoginRequest,
  LoginResponse,
  LoginResult,
  UpdateTransactionRequest,
  UpdateTransactionResponse,
  UpdateTransactionResult,
} from "@bytebank/types";
import {
  createApi,
  fetchBaseQuery,
  retry,
} from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

import { JWT_COOKIE_NAME } from "./constants";

const staggeredBaseQuery = retry(
  fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers) => {
      // ANTES: localStorage.getItem("jwt_token")
      // DEPOIS: Cookies.get(JWT_COOKIE_NAME) — acessível em SSR e Multizones
      const token =
        typeof window !== "undefined"
          ? Cookies.get(JWT_COOKIE_NAME)
          : null;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  { maxRetries: 1 },
);

const baseQueryWithReauth: typeof staggeredBaseQuery = async (
  args,
  api,
  extraOptions,
) => {
  const result = await staggeredBaseQuery(args, api, extraOptions);

  // Em 401, dispatches logout — o cookie é removido e o usuário redirecionado
  if (result.error && result.error.status === 401) {
    api.dispatch({ type: "auth/logout" });
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Account", "Transactions", "User"],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResult, LoginRequest>({
      query: (credentials) => ({
        url: "/user/auth",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: LoginResponse) => response.result,
    }),

    register: builder.mutation<CreateUserResult, CreateUserRequest>({
      query: (userData) => ({
        url: "/user",
        method: "POST",
        body: userData,
      }),
      transformResponse: (response: CreateUserResponse) => response.result,
    }),

    getAccount: builder.query<GetAccountResult, void>({
      query: () => "/account",
      transformResponse: (response: GetAccountResponse) => response.result,
      providesTags: ["Account"],
    }),

    createTransaction: builder.mutation<
      CreateTransactionResult,
      CreateTransactionRequest
    >({
      query: (transactionData) => ({
        url: "/account/transaction",
        method: "POST",
        body: transactionData,
      }),
      transformResponse: (response: CreateTransactionResponse) => response.result,
      invalidatesTags: ["Account", "Transactions"],
    }),

    getStatement: builder.query<GetStatementResult, string>({
      query: (accountId) => `/account/${accountId}/statement`,
      transformResponse: (response: GetStatementResponse) => response.result,
      providesTags: ["Transactions"],
    }),

    updateTransaction: builder.mutation<
      UpdateTransactionResult,
      { id: string; data: UpdateTransactionRequest }
    >({
      query: ({ id, data }) => ({
        url: `/account/transaction/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: UpdateTransactionResponse) => response.result,
      invalidatesTags: ["Account", "Transactions"],
    }),

    deleteTransaction: builder.mutation<DeleteTransactionResult, string>({
      query: (id) => ({
        url: `/account/transaction/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Account", "Transactions"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetAccountQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useGetStatementQuery,
} = apiSlice;
