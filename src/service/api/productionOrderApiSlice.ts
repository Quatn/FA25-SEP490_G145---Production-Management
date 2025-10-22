import { apiSlice } from "./apiSlice";
import { PRODUCTION_ORDER_URL, USE_MOCK_DATA } from "../constants";
import { mockProductionOrderQuery } from "../mock-data/functions/mock-production-orders-crud";

export const productionOrderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductionOrders: builder.query({
      ...(USE_MOCK_DATA
        ? {
          queryFn: (
            { page, limit }: { page: number; limit: number },
          ) => mockProductionOrderQuery({ page, limit }),
        }
        : {
          query: ({ page = 1, limit = 20 }) => ({
            url: `${PRODUCTION_ORDER_URL}/`,
            method: "GET",
            params: { page, limit },
            credentials: "include",
          }),
        }),
    }),
  }),
});

export const {
  useGetProductionOrdersQuery,
} = productionOrderApiSlice;
