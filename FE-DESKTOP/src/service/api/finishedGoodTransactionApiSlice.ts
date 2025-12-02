import { apiSlice } from "./apiSlice";
import { BaseResponse, PaginatedList } from "@/types/DTO/Response";
import { FinishedGoodTransactionHistory, FinishedGoodTransaction, CreateFinishedGoodTransactionDTO, FinishedGoodDailyReportResponse, GetFinishedGoodDailyReportDto, GetFinishedGoodDetailDto } from "@/types/FinishedGoodTransaction";
import { FINISHED_GOOD_TRANSACTION_URL } from "../constants";

export const FinishedGoodTransactionApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getFinishedGoodTransactions: builder.query<
            BaseResponse<PaginatedList<FinishedGoodTransactionHistory>>,
            GetFinishedGoodDetailDto
        >({
            query: (GetFinishedGoodDetailDto) => ({
                url: `${FINISHED_GOOD_TRANSACTION_URL}/list`,
                method: "GET",
                params: GetFinishedGoodDetailDto,
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

        createBulkFinishedGoodTransactions: builder.mutation<BaseResponse<FinishedGoodTransaction[]>, CreateFinishedGoodTransactionDTO[]>({
            query: (body) => ({
                url: `${FINISHED_GOOD_TRANSACTION_URL}/bulk`,
                method: "POST",
                body,
                credentials: "include",
            }),
            invalidatesTags: ["FinishedGoodTransaction", "FinishedGood"],
        }),

        getFGDailyReport: builder.query<BaseResponse<FinishedGoodDailyReportResponse>,
            GetFinishedGoodDailyReportDto
        >({
            query: (GetFinishedGoodDailyReportDto) => ({
                url: `${FINISHED_GOOD_TRANSACTION_URL}/report/daily`,
                method: "GET",
                params: GetFinishedGoodDailyReportDto,
                credentials: "include",
            }),
            providesTags: ["FinishedGoodTransaction"],
        }),
    }),
});

export const {
    useGetFinishedGoodTransactionsQuery,
    useCreateFinishedGoodTransactionMutation,
    useCreateBulkFinishedGoodTransactionsMutation,
    useGetFGDailyReportQuery,
} = FinishedGoodTransactionApiSlice;
