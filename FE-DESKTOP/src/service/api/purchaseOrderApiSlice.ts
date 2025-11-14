import { apiSlice } from "./apiSlice";
import { PURCHASE_ORDER_URL } from "../constants";
import { mockPurchaseOrdersQuery } from "../mock-data/functions/mock-purchase-orders-crud";
import { PurchaseOrder } from "@/types/PurchaseOrder";
import { createApiEndpoint } from "@/utils/endpointFactory";
import { PageResponse } from "@/types/DTO/PageResponse";
import { QueryOrdersWithUnmanufacturedItemsDto } from "@/types/DTO/purchase-order/query-orders-with-unmanufactured-items";

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

    queryOrdersWithUnmanufacturedItems: createApiEndpoint<
      PageResponse<Serialized<QueryOrdersWithUnmanufacturedItemsDto>>,
      { page: number; limit: number; search: string }
    >(builder, {
      query: ({ page, limit, search }) => ({
        url: `${PURCHASE_ORDER_URL}/query/not-fully-scheduled`,
        method: "GET",
        params: { page, limit, search },
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useGetPurchaseOrdersQuery,
  useQueryOrdersWithUnmanufacturedItemsQuery,
} = purchaseOrderApiSlice;
