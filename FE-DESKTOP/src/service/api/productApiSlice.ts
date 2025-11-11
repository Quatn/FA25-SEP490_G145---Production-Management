import { apiSlice } from "./apiSlice";
import { PRODUCT_URL } from "../constants";
import { mockProductsQuery } from "../mock-data/functions/mock-catalog-crud";
import { Product } from "@/types/Product";
import { createApiEndpoint } from "@/utils/endpointFactory";
import { PageResponse } from "@/types/DTO/PageResponse";

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: createApiEndpoint<
      PageResponse<Serialized<Product>>,
      { page: number; limit: number }
    >(builder, {
      query: ({ page, limit }) => ({
        url: `${PRODUCT_URL}/query/full-details`,
        method: "GET",
        params: { page, limit },
        credentials: "include",
      }),
      mockFn: ({ page = 1, limit = 20 }) => mockProductsQuery({ page, limit }),
    }),
  }),
});

export const {
  useGetProductsQuery,
} = productApiSlice;
