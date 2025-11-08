import { apiSlice } from "./apiSlice";
import { PaginatedList, QueryResponse } from "@/types/DTO/Response";
import { PaperSupplier } from "@/types/PaperSupplier";
import { PAPER_SUPPLIER_URL } from "../constants";

export const paperSupplierApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPaperSupplier: builder.query<PaginatedList<PaperSupplier>, { page?: number; limit?: number }>(
            {
                query: ({ page = 1, limit = 20 }) => ({
                    url: PAPER_SUPPLIER_URL,
                    method: "GET",
                    params: { page, limit },
                    credentials: "include",
                }),
                providesTags: ["PaperSupplier"],
            }),

        addPaperSupplier: builder.mutation<{ success: boolean; message: string }, PaperSupplier>({
            query: (body) => ({
                url: PAPER_SUPPLIER_URL,
                method: "POST",
                body,
                credentials: "include",
            }),
            invalidatesTags: ["PaperSupplier"],
        }),

        updatePaperSupplier: builder.mutation<{ success: boolean; message: string }, PaperSupplier>({
            query: (body) => ({
                url: `${PAPER_SUPPLIER_URL}/${body._id?.$oid ?? body._id}`,
                method: "PUT",
                body,
                credentials: "include",
            }),
            invalidatesTags: ["PaperSupplier"],
        }),

        deletePaperSupplier: builder.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({
                url: `${PAPER_SUPPLIER_URL}/${id}`,
                method: "DELETE",
                credentials: "include",
            }),
            invalidatesTags: ["PaperSupplier"],
        }),
    }),
});

export const {
    useAddPaperSupplierMutation,
    useGetPaperSupplierQuery,
    useUpdatePaperSupplierMutation,
    useDeletePaperSupplierMutation,
} = paperSupplierApiSlice;