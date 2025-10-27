import { apiSlice } from "./apiSlice";
import { PURCHASE_ORDER_URL, USE_MOCK_DATA } from "../constants";
import { mockPurchaseOrdersQuery } from "../mock-data/functions/mock-purchase-orders-crud";

export const purchaseOrderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseOrders: builder.query({
      ...(USE_MOCK_DATA
        ? {
          queryFn: (
            { page, limit }: { page: number; limit: number },
          ) => mockPurchaseOrdersQuery({ page, limit }),
        }
        : {
          query: ({ page = 1, limit = 20 }) => ({
            url: `${PURCHASE_ORDER_URL}/`,
            method: "GET",
            params: { page, limit },
            credentials: "include",
          }),
        }),
    }),
  }),
});

export const {
  useGetPurchaseOrdersQuery,
} = purchaseOrderApiSlice;
