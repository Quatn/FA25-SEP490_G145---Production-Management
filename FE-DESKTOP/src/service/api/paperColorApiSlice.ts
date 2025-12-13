import { apiSlice } from "./apiSlice";
import { BaseResponse, PaginatedList } from "@/types/DTO/Response";
import { PaperColor, PaperColorResponse } from "@/types/PaperColor";
import { PAPER_COLOR_URL } from "../constants";

export const paperColorApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getAllPaperColors: builder.query<{ success: boolean; message: string; data: PaperColorResponse[] }, void>({
            query: () => ({
                url: `${PAPER_COLOR_URL}/list-all`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["PaperColor"],
        }),

        getPaperColor: builder.query<BaseResponse<PaginatedList<PaperColor>>, { page?: number; limit?: number, search?: string }>(
            {
                query: ({ page = 1, limit = 10, search = '' }) => ({
                    url: `${PAPER_COLOR_URL}/list`,
                    method: "GET",
                    params: { page, limit, search },
                    credentials: "include",
                }),
                providesTags: ["PaperColor"],
            }),

        getDeletedPaperColor: builder.query<BaseResponse<PaginatedList<PaperColor>>, { page?: number; limit?: number }>(
            {
                query: ({ page = 1, limit = 10 }) => ({
                    url: `${PAPER_COLOR_URL}/list-deleted`,
                    method: "GET",
                    params: { page, limit },
                    credentials: "include",
                }),
                providesTags: ["PaperColor"],
            }),

        addPaperColor: builder.mutation<{ success: boolean; message: string }, PaperColor>({
            query: (body) => ({
                url: `${PAPER_COLOR_URL}/create`,
                method: "POST",
                body,
                credentials: "include",
            }),
            invalidatesTags: ["PaperColor"],
        }),

        updatePaperColor: builder.mutation<{ success: boolean; message: string }, PaperColor>({
            query: (body) => ({
                url: `${PAPER_COLOR_URL}/update/${body._id}`,
                method: "PATCH",
                body,
                credentials: "include",
            }),
            invalidatesTags: ["PaperColor"],
        }),

        deleteSoftPaperColor: builder.mutation<{ success: boolean; message: string }, PaperColor>({
            query: (body) => {
                const id = body._id;
                return {
                    url: `${PAPER_COLOR_URL}/delete-soft/${id}`,
                    method: "DELETE",
                    credentials: "include",
                };
            },
            invalidatesTags: ["PaperColor"],
        }),

        deleteHardPaperColor: builder.mutation<{ success: boolean; message: string }, PaperColor>({
            query: (body) => {
                const id = body._id;
                return {
                    url: `${PAPER_COLOR_URL}/delete-hard/${id}`,
                    method: "DELETE",
                    credentials: "include",
                };
            },
            invalidatesTags: ["PaperColor"],
        }),

        restorePaperColor: builder.mutation<{ success: boolean; message: string }, PaperColor>({
            query: (body) => {
                const id = body._id;
                return {
                    url: `${PAPER_COLOR_URL}/restore/${id}`,
                    method: "PATCH",
                    credentials: "include",
                };
            },
            invalidatesTags: ["PaperColor"],
        }),

    }),
});

export const {
    useGetAllPaperColorsQuery,
    useAddPaperColorMutation,
    useGetPaperColorQuery,
    useGetDeletedPaperColorQuery,
    useUpdatePaperColorMutation,
    useDeleteSoftPaperColorMutation,
    useRestorePaperColorMutation,
    useDeleteHardPaperColorMutation,
} = paperColorApiSlice;