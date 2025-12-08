// src/service/api/deliveryNoteApiSlice.ts
import { apiSlice } from "./apiSlice";
import { DELIVERY_NOTE_URL, PURCHASE_ORDER_ITEM_URL } from "../constants";
import { BaseResponse } from "@/types/DTO/BaseResponse";
import { DeliveryNote } from "@/types/DeliveryNote";

export const deliveryNoteApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createDeliveryNote: builder.mutation<
      BaseResponse<DeliveryNote>,
      {
        customer: string;
        // allow either list of ids or new object shape
        poitems: Array<string | { poitem: string; deliveredAmount?: number }>;
        status?: "PENDINGAPPROVAL" | "APPROVED" | "CONFIRMEDAPPROVAL";
        date?: string;
        code?: number;
      }
    >({
      query: (body) => ({
        url: `${DELIVERY_NOTE_URL}`,
        method: "POST",
        body,
        credentials: "include",
      }),
      invalidatesTags: [{ type: "DeliveryNote", id: "LIST" }, { type: "PurchaseOrderItem", id: "LIST" }],
    }),

    // new: fetch remaining amounts for poitems
    getPoitemsRemaining: builder.query<
      BaseResponse<Record<string, number>>,
      { ids: string[] }
    >({
      query: (arg) => ({
        url: `${DELIVERY_NOTE_URL}/poitems/remaining`,
        method: "POST",
        body: { ids: arg.ids },
        credentials: "include",
      }),
      // Not providing tags; this is a read helper
    }),

    listDeliveryNotes: builder.query<BaseResponse<DeliveryNote[]>, void>({
      query: () => ({
        url: `${DELIVERY_NOTE_URL}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result) =>
        result
          ? [
            ...((result.data ?? []) as any[]).map((r) => ({ type: "DeliveryNote" as const, id: r._id ?? r.id })),
            { type: "DeliveryNote" as const, id: "LIST" },
          ]
          : [{ type: "DeliveryNote" as const, id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateDeliveryNoteMutation,
  useGetPoitemsRemainingQuery,
  useListDeliveryNotesQuery,
} = deliveryNoteApiSlice;
export default deliveryNoteApiSlice;
