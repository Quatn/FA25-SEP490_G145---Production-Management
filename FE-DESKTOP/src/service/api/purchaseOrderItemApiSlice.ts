import { apiSlice } from "./apiSlice";
import { PURCHASE_ORDER_ITEM_URL, PURCHASE_ORDER_URL } from "../constants";
import { mockPurchaseOrdersQuery } from "../mock-data/functions/mock-purchase-orders-crud";
import { PurchaseOrder } from "@/types/PurchaseOrder";
import { createApiEndpoint } from "@/utils/endpointFactory";
import { PageResponse } from "@/types/DTO/PageResponse";
import { QueryOrdersWithUnmanufacturedItemsDto } from "@/types/DTO/purchase-order/query-orders-with-unmanufactured-items";
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem";
import { BaseResponse } from "@/types/DTO/BaseResponse";

export const purchaseOrderItemApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    queryPurchaseOrderItems: createApiEndpoint<
      BaseResponse<PageResponse<PurchaseOrderItem>>,
      { page?: number; limit?: number }
    >(builder, {
      query: ({ page = 1, limit = 25 }) => ({
        url: `${PURCHASE_ORDER_ITEM_URL}/query`,
        method: "GET",
        params: { page, limit },
        credentials: "include",
      }),
      providesTags: ["PurchaseOrderItem"],
    }),

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
    updatePurchaseOrderItem: builder.mutation<any, { id: string; body: Partial<any> }>({
      query: ({ id, body }) => ({
        url: `${PURCHASE_ORDER_ITEM_URL}/${id}`,
        method: "PATCH",
        body,
        credentials: "include",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "PurchaseOrder", id: "LIST" },
      ],
    }),

    deletePurchaseOrderItem: builder.mutation<any, string>({
      query: (id) => ({
        url: `${PURCHASE_ORDER_ITEM_URL}/delete-soft/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: [{ type: "PurchaseOrder", id: "LIST" }],
    }),

    getDeletedPurchaseOrderItems: builder.query<any, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 }) => ({
        url: `${PURCHASE_ORDER_ITEM_URL}/deleted`,
        method: "GET",
        params: { page, limit },
        credentials: "include",
      }),
      providesTags: (result) =>
        result
          ? [
            ...((result.data || result) as any[]).map((r: any) => ({ type: "PurchaseOrderItem" as const, id: r._id ?? r._id?.$oid ?? r.id })),
            { type: "PurchaseOrderItem" as const, id: "DELETED_LIST" },
          ]
          : [{ type: "PurchaseOrderItem" as const, id: "DELETED_LIST" }],
    }),
    restorePurchaseOrderItem: builder.mutation<any, string>({
      query: (id) => ({
        url: `${PURCHASE_ORDER_ITEM_URL}/restore/${id}`,
        method: "PATCH",
        credentials: "include",
      }),
      invalidatesTags: [{ type: "PurchaseOrderItem", id: "DELETED_LIST" }, { type: "SubPurchaseOrder", id: "LIST" }, { type: "PurchaseOrder", id: "LIST" }],
    }),
  }),
});

export const {
  useQueryPurchaseOrderItemsQuery,
  useGetFullDetailsPurchaseOrderItemsByIdsQuery,
  useUpdatePurchaseOrderItemMutation,
  useDeletePurchaseOrderItemMutation,
  useGetDeletedPurchaseOrderItemsQuery,
  useRestorePurchaseOrderItemMutation
} = purchaseOrderItemApiSlice;
