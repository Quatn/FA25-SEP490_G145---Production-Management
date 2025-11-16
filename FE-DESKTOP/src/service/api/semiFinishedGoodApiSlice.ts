import { SemiFinishedGood } from "@/types/SemiFinishedGood";
import { SEMI_FINISHED_GOOD_URL } from "../constants";
import { apiSlice } from "./apiSlice";
import { BaseResponse, PaginatedList } from "@/types/DTO/Response";

export const SemiFinishedGoodApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getSemiFinishedGoods: builder.query<
            BaseResponse<PaginatedList<SemiFinishedGood>>,
            { page?: number; limit?: number; search?: string; }
        >({
            query: ({ page = 1, limit = 10, search = '' }) => ({
                url: `${SEMI_FINISHED_GOOD_URL}/list`,
                method: "GET",
                params: { page, limit, search },
                credentials: "include",
            }),
            providesTags: ["SemiFinishedGood"],
        }),

        getSemiFinishedGoodDetail: builder.query<BaseResponse<SemiFinishedGood>, { id: string }>({
            query: ({ id }) => ({
                url: `${SEMI_FINISHED_GOOD_URL}/detail/${id}`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["SemiFinishedGood"],
        }),

        createSemiFinishedGood: builder.mutation<BaseResponse<SemiFinishedGood>, Partial<SemiFinishedGood>>({
            query: (body) => ({
                url: `${SEMI_FINISHED_GOOD_URL}/create`,
                method: "POST",
                body,
                credentials: "include",
            }),
            invalidatesTags: ["SemiFinishedGood"],
        }),

        updateSemiFinishedGood: builder.mutation<BaseResponse<SemiFinishedGood>, { id: string; data: Partial<SemiFinishedGood> }>({
            query: ({ id, data }) => ({
                url: `${SEMI_FINISHED_GOOD_URL}/update/${id}`,
                method: "PATCH",
                body: data,
                credentials: "include",
            }),
            invalidatesTags: ["SemiFinishedGood"],
        }),

        deleteSemiFinishedGood: builder.mutation<BaseResponse<SemiFinishedGood>, { id: string }>({
            query: ({ id }) => ({
                url: `${SEMI_FINISHED_GOOD_URL}/delete-soft/${id}`,
                method: "DELETE",
                credentials: "include",
            }),
            invalidatesTags: ["SemiFinishedGood"],
        }),

        restoreSemiFinishedGood: builder.mutation<BaseResponse<SemiFinishedGood>, { id: string }>({
            query: ({ id }) => ({
                url: `${SEMI_FINISHED_GOOD_URL}/restore/${id}`,
                method: "PATCH",
                credentials: "include",
            }),
            invalidatesTags: ["SemiFinishedGood"],
        }),
    }),
});

export const {
    useGetSemiFinishedGoodsQuery,
    useGetSemiFinishedGoodDetailQuery,
    useCreateSemiFinishedGoodMutation,
    useUpdateSemiFinishedGoodMutation,
    useDeleteSemiFinishedGoodMutation,
    useRestoreSemiFinishedGoodMutation,
} = SemiFinishedGoodApiSlice;
