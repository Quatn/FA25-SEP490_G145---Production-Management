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
        poitems: string[];
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

    // optional: list all delivery notes (non-paginated)
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
  useListDeliveryNotesQuery,
} = deliveryNoteApiSlice;
export default deliveryNoteApiSlice;
