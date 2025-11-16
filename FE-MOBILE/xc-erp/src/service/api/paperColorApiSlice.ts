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

        deletePaperColor: builder.mutation<{ success: boolean; message: string }, PaperColor>({
            query: (body) => ({
                url: `${PAPER_COLOR_URL}/delete-soft/${body._id}`,
                method: "DELETE",
                credentials: "include",
            }),
            invalidatesTags: ["PaperColor"],
        }),
    }),
});

export const {
    useGetAllPaperColorsQuery,
    useAddPaperColorMutation,
    useGetPaperColorQuery,
    useUpdatePaperColorMutation,
    useDeletePaperColorMutation,
} = paperColorApiSlice;