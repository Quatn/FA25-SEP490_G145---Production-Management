import { apiSlice } from "./apiSlice";
import { BaseResponse, PaginatedList } from "@/types/DTO/Response";
import { ProductType } from "@/types/ProductType";
import { PRODUCT_TYPE_URL } from "../constants";

export const ProductTypeApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getAllProductType: builder.query<{ success: boolean; message: string; data: ProductType[] }, void>({
            query: () => ({
                url: `${PRODUCT_TYPE_URL}/list-all`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["ProductType"],
        }),

        getProductType: builder.query<BaseResponse<PaginatedList<ProductType>>, { page?: number; limit?: number, search?: string }>(
            {
                query: ({ page = 1, limit = 10, search = '' }) => ({
                    url: `${PRODUCT_TYPE_URL}/list`,
                    method: "GET",
                    params: { page, limit, search },
                    credentials: "include",
                }),
                providesTags: ["ProductType"],
            }),

        addProductType: builder.mutation<{ success: boolean; message: string }, ProductType>({
            query: (body) => ({
                url: `${PRODUCT_TYPE_URL}/create`,
                method: "POST",
                body,
                credentials: "include",
            }),
            invalidatesTags: ["ProductType"],
        }),

        updateProductType: builder.mutation<{ success: boolean; message: string }, ProductType>({
            query: (body) => {
                const id = body._id;
                return {
                    url: `${PRODUCT_TYPE_URL}/update/${id}`,
                    method: "PATCH",
                    body,
                    credentials: "include",
                };
            },
            invalidatesTags: ["ProductType"],
        }),

        deleteProductType: builder.mutation<{ success: boolean; message: string }, ProductType>({
            query: (body) => {
                const id = body._id;
                return {
                    url: `${PRODUCT_TYPE_URL}/delete-soft/${id}`,
                    method: "DELETE",
                    credentials: "include",
                };
            },
            invalidatesTags: ["ProductType"],
        }),
    }),
});

export const {
    useGetAllProductTypeQuery,
    useAddProductTypeMutation,
    useGetProductTypeQuery,
    useUpdateProductTypeMutation,
    useDeleteProductTypeMutation,
} = ProductTypeApiSlice;