import { FinishedGood } from "@/types/FinishedGood";
import { FINISHED_GOOD_URL } from "../constants";
import { apiSlice } from "./apiSlice";
import { BaseResponse, PaginatedList } from "@/types/DTO/Response";

export const FinishedGoodApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getFinishedGoods: builder.query<
            BaseResponse<PaginatedList<FinishedGood>>,
            { page?: number; limit?: number; search?: string; }
        >({
            query: ({ page = 1, limit = 10, search = '' }) => ({
                url: `${FINISHED_GOOD_URL}/list`,
                method: "GET",
                params: { page, limit, search },
                credentials: "include",
            }),
            providesTags: ["FinishedGood"],
        }),

        getFinishedGoodDetail: builder.query<BaseResponse<FinishedGood>, { id: string }>({
            query: ({ id }) => ({
                url: `${FINISHED_GOOD_URL}/detail/${id}`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["FinishedGood"],
        }),

        createFinishedGood: builder.mutation<BaseResponse<FinishedGood>, Partial<FinishedGood>>({
            query: (body) => ({
                url: `${FINISHED_GOOD_URL}/create`,
                method: "POST",
                body,
                credentials: "include",
            }),
            invalidatesTags: ["FinishedGood"],
        }),

        updateFinishedGood: builder.mutation<BaseResponse<FinishedGood>, { id: string; data: Partial<FinishedGood> }>({
            query: ({ id, data }) => ({
                url: `${FINISHED_GOOD_URL}/update/${id}`,
                method: "PATCH",
                body: data,
                credentials: "include",
            }),
            invalidatesTags: ["FinishedGood"],
        }),

        deleteFinishedGood: builder.mutation<BaseResponse<FinishedGood>, { id: string }>({
            query: ({ id }) => ({
                url: `${FINISHED_GOOD_URL}/delete-soft/${id}`,
                method: "DELETE",
                credentials: "include",
            }),
            invalidatesTags: ["FinishedGood"],
        }),

        restoreFinishedGood: builder.mutation<BaseResponse<FinishedGood>, { id: string }>({
            query: ({ id }) => ({
                url: `${FINISHED_GOOD_URL}/restore/${id}`,
                method: "PATCH",
                credentials: "include",
            }),
            invalidatesTags: ["FinishedGood"],
        }),
    }),
});

export const {
    useGetFinishedGoodsQuery,
    useGetFinishedGoodDetailQuery,
    useCreateFinishedGoodMutation,
    useUpdateFinishedGoodMutation,
    useDeleteFinishedGoodMutation,
    useRestoreFinishedGoodMutation,
} = FinishedGoodApiSlice;
