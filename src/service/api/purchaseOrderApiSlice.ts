import { apiSlice } from "./apiSlice";
import { PURCHASE_ORDER_URL, USE_MOCK_DATA } from "../constants";
import { mockPurchaseOrdersQuery } from "../mock-data/functions/mock-purchase-orders-crud";
import { PaginatedList, QueryResponse } from "@/types/DTO/Response";
import { PurchaseOrder } from "@/types/PurchaseOrder";

export const purchaseOrderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseOrders: builder.query({
      ...(USE_MOCK_DATA
        ? {
          queryFn: async (
            { page, limit }: { page: number; limit: number },
          ): Promise<
            QueryResponse<PaginatedList<PurchaseOrder>>
          > => {
            try {
              const data = await mockPurchaseOrdersQuery({
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
