import { apiSlice } from "./apiSlice";
import { PRODUCT_URL, USE_MOCK_DATA } from "../constants";
import { mockProductsQuery } from "../mock-data/functions/mock-catalog-crud";

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      ...(USE_MOCK_DATA
        ? {
          queryFn: (
            { page, limit }: { page: number; limit: number },
          ) => mockProductsQuery({ page, limit }),
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
