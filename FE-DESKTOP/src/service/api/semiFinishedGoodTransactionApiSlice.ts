import { apiSlice } from "./apiSlice";
import { BaseResponse, PaginatedList } from "@/types/DTO/Response";
import { DailyChartResponse, SemiFinishedGoodTransaction, SemiFinishedGoodTransactionHistory } from "@/types/SemiFinishedTransaction";
import { SEMI_FINISHED_GOOD_TRANSACTION_URL } from "../constants";

export const SemiFinishedGoodTransactionApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getSemiFinishedGoodTransactions: builder.query<
            BaseResponse<PaginatedList<SemiFinishedGoodTransactionHistory>>,
            { page?: number; limit?: number; semiFinishedGood: string, search?: string, transactionType?: string, startDate?: string, endDate?: string, sort?: string }
        >({
            query: ({ page = 1, limit = 10, semiFinishedGood, search, transactionType, startDate, endDate, sort }) => ({
                url: `${SEMI_FINISHED_GOOD_TRANSACTION_URL}/list`,
                method: "GET",
                params: { page, limit, semiFinishedGood, search, transactionType, startDate, endDate, sort },
                credentials: "include",
            }),
            providesTags: ["SemiFinishedGoodTransaction"],
        }),

        getSemiFinishedGoodAdjustmentTransaction: builder.query<
            BaseResponse<PaginatedList<SemiFinishedGoodTransaction>>,
            { page?: number; limit?: number; search?: string }>({
                query: ({ page = 1, limit = 10, search }) => ({
                    url: `${SEMI_FINISHED_GOOD_TRANSACTION_URL}/list-adjustment`,
                    method: "GET",
                    params: { page, limit, search },
                    credentials: "include",
                }),
                providesTags: ["SemiFinishedGoodTransaction"],
            }),

        getSemiFinishedGoodVolumeChartData: builder.query<DailyChartResponse, { date: string }>({
            query: ({ date }) => ({
                url: `${SEMI_FINISHED_GOOD_TRANSACTION_URL}/chart/daily`,
                method: "GET",
                params: { date },
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

    }),
});

export const {
    useGetSemiFinishedGoodTransactionsQuery,
    useCreateSemiFinishedGoodTransactionMutation,
    useGetSemiFinishedGoodAdjustmentTransactionQuery,
    useGetSemiFinishedGoodVolumeChartDataQuery,
} = SemiFinishedGoodTransactionApiSlice;
