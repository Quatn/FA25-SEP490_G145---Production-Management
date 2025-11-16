import { apiSlice } from "./apiSlice";
import { BaseResponse, PaginatedList } from "@/types/DTO/Response";
import { PaperSupplier } from "@/types/PaperSupplier";
import { PAPER_SUPPLIER_URL } from "../constants";

export const paperSupplierApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getAllPaperSuppliers: builder.query<PaperSupplier[], void>({
            query: () => ({
                url: `${PAPER_SUPPLIER_URL}/list-all`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["PaperSupplier"],
        }),

        getPaperSupplier: builder.query<BaseResponse<PaginatedList<PaperSupplier>>, { page?: number; limit?: number, search?: string }>(
            {
                query: ({ page = 1, limit = 10, search = '' }) => ({
                    url: `${PAPER_SUPPLIER_URL}/list`,
                    method: "GET",
                    params: { page, limit, search },
                    credentials: "include",
                }),
                providesTags: ["PaperSupplier"],
            }),

        addPaperSupplier: builder.mutation<{ success: boolean; message: string }, PaperSupplier>({
            query: (body) => ({
                url: `${PAPER_SUPPLIER_URL}/create`,
                method: "POST",
                body,
                credentials: "include",
            }),
            invalidatesTags: ["PaperSupplier"],
        }),

        updatePaperSupplier: builder.mutation<{ success: boolean; message: string }, PaperSupplier>({
            query: (body) => ({
                url: `${PAPER_SUPPLIER_URL}/update/${body._id?.$oid ?? body._id}`,
                method: "PATCH",
                body,
                credentials: "include",
            }),
            invalidatesTags: ["PaperSupplier"],
        }),

        deletePaperSupplier: builder.mutation<{ success: boolean; message: string }, PaperSupplier>({
            query: (body) => ({
                url: `${PAPER_SUPPLIER_URL}/delete-soft/${body._id?.$oid ?? body._id}`,
                method: "DELETE",
                credentials: "include",
            }),
            invalidatesTags: ["PaperSupplier"],
        }),
    }),
});

export const {
    useGetAllPaperSuppliersQuery,
    useAddPaperSupplierMutation,
    useGetPaperSupplierQuery,
    useUpdatePaperSupplierMutation,
    useDeletePaperSupplierMutation,
} = paperSupplierApiSlice;