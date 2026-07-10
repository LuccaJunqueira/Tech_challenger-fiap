import type {
  CreateUserRequest,
  CreateUserResponse,
  CreateUserResult,
  LoginRequest,
  LoginResponse,
  LoginResult,
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

  if (result.error && result.error.status === 401) {
    api.dispatch({ type: "auth/logout" });
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [],
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
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
} = apiSlice;
