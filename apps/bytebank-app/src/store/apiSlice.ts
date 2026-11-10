import type {
  AccountOverviewDto,
  CreateTransactionRequest,
  CreateTransactionResult,
  DeleteTransactionResult,
  UpdateTransactionRequest,
  UpdateTransactionResult,
} from "@bytebank/types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "/api",
});

const baseQueryWithReauth: typeof baseQuery = async (
  args,
  api,
  extraOptions,
) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    api.dispatch({ type: "auth/logout" });
    api.dispatch({ type: "api/resetApiState" });
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Account", "Transactions"],
  endpoints: (builder) => ({
    getAccount: builder.query<AccountOverviewDto, void>({
      query: () => "/account",
      providesTags: ["Account"],
    }),

    createTransaction: builder.mutation<
      CreateTransactionResult,
      Omit<CreateTransactionRequest, "accountId">
    >({
      query: (transactionData) => ({
        url: "/transactions",
        method: "POST",
        body: transactionData,
      }),
      transformResponse: (response: { result: CreateTransactionResult }) =>
        response.result,
      invalidatesTags: ["Account", "Transactions"],
    }),

    updateTransaction: builder.mutation<
      UpdateTransactionResult,
      { id: string; data: UpdateTransactionRequest }
    >({
      query: ({ id, data }) => ({
        url: `/transactions/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: { result: UpdateTransactionResult }) =>
        response.result,
      invalidatesTags: ["Account", "Transactions"],
    }),

    deleteTransaction: builder.mutation<DeleteTransactionResult, string>({
      query: (id) => ({
        url: `/transactions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Account", "Transactions"],
    }),
  }),
});

export const {
  useGetAccountQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} = apiSlice;
