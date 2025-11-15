import { apiSlice } from "./apiSlice";
import { BaseResponse, PaginatedList } from "@/types/DTO/Response";
import { SemiFinishedGoodTransaction } from "@/types/SemiFinishedTransaction";
import { SEMI_FINISHED_GOOD_TRANSACTION_URL } from "../constants";
import { get } from "http";
import { DailyReportDto } from "@/types/DTO/semi-finished-good/query-daily-report";

export const SemiFinishedGoodTransactionApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTransactions: builder.query<
            BaseResponse<PaginatedList<SemiFinishedGoodTransaction>>,
            { page?: number; limit?: number; search?: string, semiFinishedGoodId : string }
        >({
            query: ({ page = 1, limit = 10, search = "", semiFinishedGoodId  }) => ({
                url: `${SEMI_FINISHED_GOOD_TRANSACTION_URL}/list`,
                method: "GET",
                params: { page, limit, search, semiFinishedGoodId  },
                credentials: "include",
            }),
            providesTags: ["SemiFinishedGoodTransaction"],
        }),

        createTransaction: builder.mutation<BaseResponse<SemiFinishedGoodTransaction>, Partial<SemiFinishedGoodTransaction>>({
            query: (body) => ({
                url: `${SEMI_FINISHED_GOOD_TRANSACTION_URL}/create`,
                method: "POST",
                body,
                credentials: "include",
            }),
            invalidatesTags: ["SemiFinishedGood"],
        }),

        getDailyReport: builder.query<BaseResponse<DailyReportDto>,{ date: string }>({
            query: ({ date }) => ({
                url: `${SEMI_FINISHED_GOOD_TRANSACTION_URL}/report/daily`,
                method: "GET",
                params: { date },
                credentials: "include",
            }),
            providesTags: ["SemiFinishedGoodTransaction"],
        }),
    }),
});

export const {
    useGetTransactionsQuery,
    useCreateTransactionMutation,
    useGetDailyReportQuery,
} = SemiFinishedGoodTransactionApiSlice;
