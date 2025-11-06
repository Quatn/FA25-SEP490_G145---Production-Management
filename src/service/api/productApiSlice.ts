import { apiSlice } from "./apiSlice";
import { PRODUCT_URL, USE_MOCK_DATA } from "../constants";
import { mockProductQuery } from "../mock-data/functions/mock-products-crud";

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProduct: builder.query({
      ...(USE_MOCK_DATA
        ? {
            queryFn: ({ page, limit }) => mockProductQuery({ page, limit }),
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

export const { useGetProductQuery } = productApiSlice;
