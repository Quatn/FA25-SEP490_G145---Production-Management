// subPurchaseOrderApiSlice.ts
import { apiSlice } from "./apiSlice";
import { SUB_PURCHASE_ORDER_URL } from "../constants";

export const subPurchaseOrderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createFromProducts: builder.mutation<any, { purchaseOrderId: string; products: { productId: string; deliveryDate: string; status: string }[] }>({
      query: (body) => ({
        url: `${SUB_PURCHASE_ORDER_URL}/create-from-products`,
        method: "POST",
        body,
        credentials: "include",
      }),
      invalidatesTags: [{ type: "PurchaseOrder", id: "LIST" }, { type: "SubPurchaseOrder", id: "LIST" }],
    }),
    getSubPurchaseOrders: builder.query<any, { purchaseOrderId?: string }>({
      query: ({ purchaseOrderId } = {}) => ({
        url: `${SUB_PURCHASE_ORDER_URL}`,
        method: "GET",
        params: { purchaseOrderId },
        credentials: "include",
      }),
      providesTags: (result) =>
        result
          ? [
            ...((result.data || result) as any[]).map((r: any) => ({ type: "SubPurchaseOrder" as const, id: r._id ?? r._id?.$oid ?? r.id })),
            { type: "SubPurchaseOrder" as const, id: "LIST" },
          ]
          : [{ type: "SubPurchaseOrder" as const, id: "LIST" }],
    }),
    updateSubPurchaseOrder: builder.mutation<any, { id: string; body: Partial<any> }>({
      query: ({ id, body }) => ({
        url: `${SUB_PURCHASE_ORDER_URL}/${id}`,
        method: "PATCH",
        body,
        credentials: "include",
      }),
      invalidatesTags: (res, err, arg) => [{ type: "PurchaseOrder", id: arg.id }, { type: "PurchaseOrder", id: "LIST" }],
    }),

    deleteSubPurchaseOrder: builder.mutation<any, string>({
      query: (id) => ({
        url: `${SUB_PURCHASE_ORDER_URL}/delete-soft/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: [{ type: "PurchaseOrder", id: "LIST" }],
    }),

    getDeletedSubPurchaseOrders: builder.query<any, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 }) => ({
        url: `${SUB_PURCHASE_ORDER_URL}/deleted`,
        method: "GET",
        params: { page, limit },
        credentials: "include",
      }),
      providesTags: (result) =>
        result
          ? [
            ...((result.data || result) as any[]).map((r: any) => ({ type: "SubPurchaseOrder" as const, id: r._id ?? r._id?.$oid ?? r.id })),
            { type: "SubPurchaseOrder" as const, id: "DELETED_LIST" },
          ]
          : [{ type: "SubPurchaseOrder" as const, id: "DELETED_LIST" }],
    }),

    restoreSubPurchaseOrder: builder.mutation<any, string>({
      query: (id) => ({
        url: `${SUB_PURCHASE_ORDER_URL}/restore/${id}`,
        method: "PATCH",
        credentials: "include",
      }),
      invalidatesTags: [{ type: "SubPurchaseOrder", id: "DELETED_LIST" }, { type: "PurchaseOrder", id: "LIST" }],
    }),
  }),
});

export const { useCreateFromProductsMutation, useGetSubPurchaseOrdersQuery, useUpdateSubPurchaseOrderMutation,
  useDeleteSubPurchaseOrderMutation, useGetDeletedSubPurchaseOrdersQuery,
  useRestoreSubPurchaseOrderMutation, } = subPurchaseOrderApiSlice;
