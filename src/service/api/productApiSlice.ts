import { apiSlice } from "./apiSlice";
import { PRODUCT_URL, USE_MOCK_DATA } from "../constants";
import { mockProductsQuery } from "../mock-data/functions/mock-catalog-crud";
import { PaginatedList, QueryResponse } from "@/types/DTO/Response";
import { Product } from "@/types/Product";

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<
        PaginatedList<Product>,
          { page: number; limit: number }
  >({
      ...(USE_MOCK_DATA
        ? {
          queryFn: async (
            { page, limit }: { page: number; limit: number },
          ): Promise<
            QueryResponse<PaginatedList<Product>>
          > => {
            try {
              const data = await mockProductsQuery({
                page,
                limit,
              });
              return {
                data,
              };
            } catch (err) {
              return {
                error: {
                  status: "CUSTOM_ERROR",
                  error: (err as Error).message,
                },
              };
            }
          },
        }
        : {
          query: ({ page = 1, limit = 20 }) => ({
            url: `${PRODUCT_URL}/`,
            method: "GET",
            params: { page, limit },
            credentials: "include",
          }),
        }),
    }),
  }),
});

export const {
  useGetProductsQuery,
} = productApiSlice;
