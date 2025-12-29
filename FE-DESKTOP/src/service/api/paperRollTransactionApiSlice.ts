// src/service/api/paperRollTransactionApiSlice.ts
import { apiSlice } from "./apiSlice";
import { BaseResponse, PaginatedList } from "@/types/DTO/Response";
import { PaperRollTransaction } from "@/types/PaperRollTransaction";
import { PAPER_ROLL_TRANSACTION_URL } from "../constants";

export const paperRollTransactionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<
      BaseResponse<PaginatedList<PaperRollTransaction>>,
      { page?: number; limit?: number; search?: string; paperRollId?: string } 
    >({
      query: ({ page = 1, limit = 100, search = "", paperRollId }) => ({
        url: `${PAPER_ROLL_TRANSACTION_URL}/list`,
        method: "GET",
        // only include paperRollId when it exists
        params: { page, limit, search, ...(paperRollId ? { paperRollId } : {}) },
        credentials: "include",
      }),
      providesTags: ["PaperRollTransaction"],
    }),

    createTransaction: builder.mutation<BaseResponse<any>, Partial<PaperRollTransaction>>({
      query: (body) => ({
        url: `${PAPER_ROLL_TRANSACTION_URL}/create`,
        method: "POST",
        body,
        credentials: "include",
      }),
      invalidatesTags: ["PaperRollTransaction"],
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useCreateTransactionMutation,
} = paperRollTransactionApiSlice;
