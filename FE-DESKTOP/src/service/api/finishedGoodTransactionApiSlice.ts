import { apiSlice } from "./apiSlice";
import { BaseResponse, PaginatedList } from "@/types/DTO/Response";
import { FinishedGoodTransaction } from "@/types/FinishedGoodTransaction";
import { FINISHED_GOOD_TRANSACTION_URL } from "../constants";
import { DailyReportDto } from "@/types/DTO/finished-good/query-daily-report";

export const FinishedGoodTransactionApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getFinishedGoodTransactions: builder.query<
            BaseResponse<PaginatedList<FinishedGoodTransaction>>,
            { page?: number; limit?: number; search?: string, finishedGoodId: string }
        >({
            query: ({ page = 1, limit = 10, search = "", finishedGoodId }) => ({
                url: `${FINISHED_GOOD_TRANSACTION_URL}/list`,
                method: "GET",
                params: { page, limit, search, finishedGoodId },
                credentials: "include",
            }),
            providesTags: ["FinishedGoodTransaction"],
        }),

        createFinishedGoodTransaction: builder.mutation<BaseResponse<FinishedGoodTransaction>, Partial<FinishedGoodTransaction>>({
            query: (body) => ({
                url: `${FINISHED_GOOD_TRANSACTION_URL}/create`,
                method: "POST",
                body,
                credentials: "include",
            }),
            invalidatesTags: ["FinishedGoodTransaction", "FinishedGood"],
        }),

        getFGDailyReport: builder.query<BaseResponse<DailyReportDto>, { date: string }>({
            query: ({ date }) => ({
                url: `${FINISHED_GOOD_TRANSACTION_URL}/report/daily`,
                method: "GET",
                params: { date },
                credentials: "include",
            }),
            providesTags: ["FinishedGoodTransaction"],
        }),
    }),
});

export const {
    useGetFinishedGoodTransactionsQuery,
    useCreateFinishedGoodTransactionMutation,
    useGetFGDailyReportQuery,
} = FinishedGoodTransactionApiSlice;
