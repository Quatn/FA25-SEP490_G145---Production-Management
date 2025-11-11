import { apiSlice } from "./apiSlice";
import { BaseResponse, PaginatedList } from "@/types/DTO/Response";
import { PaperType, PaperTypeRequest } from "@/types/PaperType";
import { PAPER_TYPE_URL } from "../constants";


export const paperTypeApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getAllPaperTypes: builder.query<PaperType[], void>({
            query: () => ({
                url: `${PAPER_TYPE_URL}/list-all`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["PaperType"],
        }),

        getPaperType: builder.query<BaseResponse<PaginatedList<PaperType>>, { page?: number; limit?: number, search?: string }>(
            {
                query: ({ page = 1, limit = 10, search = '' }) => ({
                    url: `${PAPER_TYPE_URL}/list`,
                    method: "GET",
                    params: { page, limit, search },
                    credentials: "include",
                }),
                providesTags: ["PaperType"],
            }),

        addPaperType: builder.mutation<{ success: boolean; message: string }, PaperTypeRequest>({
            query: (body) => ({
                url: `${PAPER_TYPE_URL}/create`,
                method: "POST",
                body,
                credentials: "include",
            }),
            invalidatesTags: ["PaperType"],
        }),

        updatePaperType: builder.mutation<{ success: boolean; message: string }, PaperTypeRequest>({
            query: (body) => ({
                url: `${PAPER_TYPE_URL}/update/${body._id?.$oid ?? body._id}`,
                method: "PATCH",
                body,
                credentials: "include",
            }),
            invalidatesTags: ["PaperType"],
        }),

        deletePaperType: builder.mutation<{ success: boolean; message: string }, PaperType>({
            query: (body) => ({
                url: `${PAPER_TYPE_URL}/delete-soft/${body._id?.$oid ?? body._id}`,
                method: "DELETE",
                credentials: "include",
            }),
            invalidatesTags: ["PaperType"],
        }),
    }),
});

export const {
    useGetAllPaperTypesQuery,
    useAddPaperTypeMutation,
    useGetPaperTypeQuery,
    useUpdatePaperTypeMutation,
    useDeletePaperTypeMutation,
} = paperTypeApiSlice;