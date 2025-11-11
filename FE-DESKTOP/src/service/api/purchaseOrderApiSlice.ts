import { apiSlice } from "./apiSlice";
import { PURCHASE_ORDER_URL } from "../constants";
import { mockPurchaseOrdersQuery } from "../mock-data/functions/mock-purchase-orders-crud";
import { PurchaseOrder } from "@/types/PurchaseOrder";
import { createApiEndpoint } from "@/utils/endpointFactory";
import { PageResponse } from "@/types/DTO/PageResponse";

export const purchaseOrderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseOrders: createApiEndpoint<
      PageResponse<Serialized<PurchaseOrder>>,
      { page: number; limit: number }
    >(builder, {
      query: ({ page, limit }) => ({
        url: `${PURCHASE_ORDER_URL}/`,
        method: "GET",
        params: { page, limit },
        credentials: "include",
      }),
      mockFn: ({ page = 1, limit = 20 }) =>
        mockPurchaseOrdersQuery({ page, limit }),
    }),
  }),
});

export const {
  useGetPurchaseOrdersQuery,
} = purchaseOrderApiSlice;
