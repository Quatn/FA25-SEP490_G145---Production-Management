import { apiSlice } from "./apiSlice";
import { BaseResponse, PaginatedList } from "@/types/DTO/Response";
import { EmployeeDailyStats, SemiFinishedGoodTransaction } from "@/types/SemiFinishedTransaction";
import { SEMI_FINISHED_GOOD_TRANSACTION_URL } from "../constants";

export const SemiFinishedGoodTransactionApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getSemiFinishedGoodTransactions: builder.query<
            BaseResponse<PaginatedList<SemiFinishedGoodTransaction>>,
            { page?: number; limit?: number; search?: string, semiFinishedGoodId: string }
        >({
            query: ({ page = 1, limit = 10, search = "", semiFinishedGoodId }) => ({
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

        getSFGDailyEmployees: builder.query<BaseResponse<EmployeeDailyStats[]>, { date: string }>({
            query: ({ date }) => ({
                url: `${SEMI_FINISHED_GOOD_TRANSACTION_URL}/employees/daily`,
                method: "GET",
                params: { date },
                credentials: "include",
            }),
            providesTags: ["SemiFinishedGoodTransaction"],
        }),

        getSFGDailyReport: builder.query<BaseResponse<PaginatedList<SemiFinishedGoodTransaction>>, {
            page: number;
            limit: number;
            date: string,
            transactionType?: string,
            employeeId?: string,
            manufacturingOrderId?: string
        }>({
            query: ({ page = 1, limit = 10, date, transactionType, employeeId, manufacturingOrderId }) => ({
                url: `${SEMI_FINISHED_GOOD_TRANSACTION_URL}/report/daily`,
                method: "GET",
                params: { page, limit, date, transactionType, employeeId, manufacturingOrderId },
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
    useGetSFGDailyEmployeesQuery,
} = SemiFinishedGoodTransactionApiSlice;
