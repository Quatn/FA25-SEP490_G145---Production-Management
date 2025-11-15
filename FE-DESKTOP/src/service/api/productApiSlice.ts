import { apiSlice } from "./apiSlice";
import { PRODUCT_URL } from "../constants";
import { PaginatedList } from "@/types/DTO/Response";
import { Product } from "@/types/Product";
import { createApiEndpoint } from "@/utils/endpointFactory";
import { PageResponse } from "@/types/DTO/PageResponse";

type GetProductListParams = {
  page?: number;
  limit?: number;
  search?: string;
  productType?: string;
  customer?: string; // Changed from customerCode to customer (ObjectId)
};

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<
      PaginatedList<Serialized<Product>>,
      GetProductListParams
    >({
      query: ({ page = 1, limit = 20, search, productType, customer }) => ({
        url: `${PRODUCT_URL}/`,
        method: "GET",
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(productType ? { productType } : {}),
          ...(customer ? { customer } : {}),
        },
        credentials: "include",
      }),
      transformResponse: (response: {
        data: Product[];
        page: number;
        limit: number;
        total: number;
      }): PaginatedList<Serialized<Product>> => {
        const totalPages = Math.max(1, Math.ceil((response.total || 0) / (response.limit || 1)));
        return {
          data: response.data as unknown as Serialized<Product>[],
          page: response.page,
          limit: response.limit,
          totalItems: response.total,
          totalPages,
          hasNextPage: response.page < totalPages,
          hasPrevPage: response.page > 1,
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((product: any) => ({
                type: "Product" as const,
                id: product._id ?? product.id,
              })),
              { type: "Product" as const, id: "LIST" },
            ]
          : [{ type: "Product" as const, id: "LIST" }],
    }),
    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (body) => ({
        url: `${PRODUCT_URL}/`,
        method: "POST",
        body,
        credentials: "include",
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
    updateProduct: builder.mutation<
      Product,
      { productId: string; body: Partial<Product> }
    >({
      query: ({ productId, body }) => ({
        url: `${PRODUCT_URL}/${productId}`,
        method: "PUT",
        body,
        credentials: "include",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Product", id: arg.productId },
        { type: "Product", id: "LIST" },
      ],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (productId) => ({
        url: `${PRODUCT_URL}/${productId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: (result, error, productId) => [
        { type: "Product", id: productId },
        { type: "Product", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApiSlice;
