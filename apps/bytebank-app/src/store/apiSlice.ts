import type { AccountOverviewDto } from "@bytebank/types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({ baseUrl: "/api" });

const baseQueryWithReauth: typeof baseQuery = async (
  args,
  api,
  extraOptions,
) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    api.dispatch({ type: "auth/logout" });
    api.dispatch({ type: "api/resetApiState" });
  }

  return result;
};

export type TransactionDto = AccountOverviewDto["transactions"][number];

export type CreateTransactionInput = {
  type: "Credit" | "Debit";
  value: number;
  from?: string;
  to?: string;
  anexo?: string;
  urlAnexo?: string;
};

export type UpdateTransactionInput = {
  id: string;
  data: CreateTransactionInput;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Account"],
  endpoints: (builder) => ({
    getAccount: builder.query<AccountOverviewDto, void>({
      query: () => "/account",
      providesTags: ["Account"],
    }),

    createTransaction: builder.mutation<
      TransactionDto,
      CreateTransactionInput
    >({
      query: (data) => ({
        url: "/transactions",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Account"],
    }),

    updateTransaction: builder.mutation<
      TransactionDto,
      UpdateTransactionInput
    >({
      query: ({ id, data }) => ({
        url: `/transactions/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Account"],
    }),

    deleteTransaction: builder.mutation<void, string>({
      query: (id) => ({
        url: `/transactions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Account"],
    }),
  }),
});

export const {
  useGetAccountQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} = apiSlice;
