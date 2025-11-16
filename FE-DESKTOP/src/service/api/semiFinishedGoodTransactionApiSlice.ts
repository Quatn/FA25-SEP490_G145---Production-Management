import { apiSlice } from "./apiSlice";
import { BaseResponse, PaginatedList } from "@/types/DTO/Response";
import { SemiFinishedGoodTransaction } from "@/types/SemiFinishedTransaction";
import { SEMI_FINISHED_GOOD_TRANSACTION_URL } from "../constants";
import { get } from "http";
import { DailyReportDto } from "@/types/DTO/semi-finished-good/query-daily-report";

export const SemiFinishedGoodTransactionApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getSemiFinishedGoodTransactions: builder.query<
            BaseResponse<PaginatedList<SemiFinishedGoodTransaction>>,
            { page?: number; limit?: number; search?: string, finishedGoodId: string }
        >({
            query: ({ page = 1, limit = 10, search = "", finishedGoodId: semiFinishedGoodId }) => ({
                url: `${SEMI_FINISHED_GOOD_TRANSACTION_URL}/list`,
                method: "GET",
                params: { page, limit, search, semiFinishedGoodId },
                credentials: "include",
            }),
            providesTags: ["SemiFinishedGoodTransaction"],
        }),

        createSemiFinishedGoodTransaction: builder.mutation<BaseResponse<SemiFinishedGoodTransaction>, Partial<SemiFinishedGoodTransaction>>({
            query: (body) => ({
                url: `${SEMI_FINISHED_GOOD_TRANSACTION_URL}/create`,
                method: "POST",
                body,
                credentials: "include",
            }),
            invalidatesTags: ["SemiFinishedGoodTransaction", "SemiFinishedGood"],
        }),

        getSFGDailyReport: builder.query<BaseResponse<DailyReportDto>, { date: string }>({
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
    useGetSemiFinishedGoodTransactionsQuery,
    useCreateSemiFinishedGoodTransactionMutation,
    useGetSFGDailyReportQuery,
} = SemiFinishedGoodTransactionApiSlice;
