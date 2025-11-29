import { apiSlice } from "./apiSlice";
import { BaseResponse, PaginatedList } from "@/types/DTO/Response";
import { PurchaseOrder as ServerPO } from "@/types/PurchaseOrder"; // adapt if needed
import { PURCHASE_ORDER_URL } from "../constants";
import { createApiEndpoint } from "@/utils/endpointFactory";
import { PageResponse } from "@/types/DTO/PageResponse";
import { QueryOrdersWithUnmanufacturedItemsDto } from "@/types/DTO/purchase-order/query-orders-with-unmanufactured-items";

export const purchaseOrderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseOrders: builder.query<BaseResponse<PaginatedList<any>>, { page?: number; limit?: number; search?: string }>({
      query: ({ page = 1, limit = 20, search = "" }) => ({
        url: `${PURCHASE_ORDER_URL}/query`,
        method: "GET",
        params: { page, limit, search },
        credentials: "include",
      }),
      providesTags: (result) =>
        result
          ? [
            ...result.data.data.map((r: any) => ({ type: "PurchaseOrder" as const, id: r._id ?? r._id?.$oid ?? r.id })),
            { type: "PurchaseOrder" as const, id: "LIST" },
          ]
          : [{ type: "PurchaseOrder" as const, id: "LIST" }],
    }),

    getPurchaseOrder: builder.query<BaseResponse<any>, string>({
      query: (id) => ({ url: `${PURCHASE_ORDER_URL}/detail/${id}`, method: "GET", credentials: "include" }),
      providesTags: (result, error, id) => [{ type: "PurchaseOrder" as const, id }],
    }),

    getPurchaseOrderWithSubs: builder.query<BaseResponse<any>, string>({
      query: (id) => ({ url: `${PURCHASE_ORDER_URL}/detailwithsub/${id}`, method: "GET", credentials: "include" }),
      providesTags: (result, error, id) => [{ type: "PurchaseOrder" as const, id }],
    }),

    createPurchaseOrder: builder.mutation<BaseResponse<any>, Partial<any>>({
      query: (body) => ({ url: `${PURCHASE_ORDER_URL}/create`, method: "POST", body, credentials: "include" }),
      invalidatesTags: [{ type: "PurchaseOrder", id: "LIST" }],
    }),

    updatePurchaseOrder: builder.mutation<BaseResponse<any>, { id: string; body: Partial<any> }>({
      query: ({ id, body }) => ({ url: `${PURCHASE_ORDER_URL}/update/${id}`, method: "PATCH", body, credentials: "include" }),
      invalidatesTags: (result, error, arg) => [{ type: "PurchaseOrder", id: arg.id }, { type: "PurchaseOrder", id: "LIST" }],
    }),

    deletePurchaseOrder: builder.mutation<BaseResponse<null>, string>({
      query: (id) => ({ url: `${PURCHASE_ORDER_URL}/delete-soft/${id}`, method: "DELETE", credentials: "include" }),
      invalidatesTags: [{ type: "PurchaseOrder", id: "LIST" }],
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
      providesTags: ["ManufacturingOrder", "PurchaseOrder"],
    }),
    getDeletedPurchaseOrders: builder.query<any, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 }) => ({
        url: `${PURCHASE_ORDER_URL}/deleted`,
        method: "GET",
        params: { page, limit },
        credentials: "include",
      }),
      providesTags: (result) =>
        result
          ? [
            ...((result.data || result) as any[]).map((r: any) => ({ type: "PurchaseOrder" as const, id: r._id ?? r._id?.$oid ?? r.id })),
            { type: "PurchaseOrder" as const, id: "DELETED_LIST" },
          ]
          : [{ type: "PurchaseOrder" as const, id: "DELETED_LIST" }],
    }),

    restorePurchaseOrder: builder.mutation<any, string>({
      query: (id) => ({
        url: `${PURCHASE_ORDER_URL}/restore/${id}`,
        method: "PATCH",
        credentials: "include",
      }),
      invalidatesTags: [{ type: "PurchaseOrder", id: "DELETED_LIST" }, { type: "PurchaseOrder", id: "LIST" }],
    }),
  }),
});

export const {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderQuery,
  useGetPurchaseOrderWithSubsQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
  useQueryOrdersWithUnmanufacturedItemsQuery,
  useGetDeletedPurchaseOrdersQuery,
  useRestorePurchaseOrderMutation,
} = purchaseOrderApiSlice;
