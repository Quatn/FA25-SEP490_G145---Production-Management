import { apiSlice } from "./apiSlice";
import { PURCHASE_ORDER_URL } from "../constants";
import { mockPurchaseOrdersQuery } from "../mock-data/functions/mock-purchase-orders-crud";
import { PurchaseOrder } from "@/types/PurchaseOrder";
import { createApiEndpoint } from "@/utils/endpointFactory";
import { PageResponse } from "@/types/DTO/PageResponse";
import { QueryOrdersWithUnmanufacturedItemsDto } from "@/types/DTO/purchase-order/query-orders-with-unmanufactured-items";
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem";
import { BaseResponse } from "@/types/DTO/BaseResponse";

export const purchaseOrderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFullDetailsPurchaseOrderItemsByIds: createApiEndpoint<
      BaseResponse<Serialized<PurchaseOrderItem>[]>,
      { ids: string[] }
    >(builder, {
      query: ({ ids }) => ({
        url: `${PURCHASE_ORDER_URL}/query/full-details/by-ids`,
        method: "GET",
        params: { ids },
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useGetFullDetailsPurchaseOrderItemsByIdsQuery,
} = purchaseOrderApiSlice;
