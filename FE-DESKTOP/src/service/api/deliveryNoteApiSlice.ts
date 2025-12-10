// src/service/api/deliveryNoteApiSlice.ts
import { apiSlice } from "./apiSlice";
import { DELIVERY_NOTE_URL } from "../constants";
import { BaseResponse } from "@/types/DTO/BaseResponse";
import { DeliveryNote } from "@/types/DeliveryNote";

export const deliveryNoteApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createDeliveryNote: builder.mutation<
      BaseResponse<DeliveryNote>,
      {
        customer: string;
        poitems: Array<string | { poitem: string; deliveredAmount?: number }>;
        status?: "PENDINGAPPROVAL" | "APPROVED" | "EXPORTED" | "CANCELLED";
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
      invalidatesTags: [
        { type: "DeliveryNote" as const, id: "LIST" },
        { type: "PurchaseOrderItem" as const, id: "LIST" },
      ],
    }),

    // get remaining amounts for poitems (unchanged)
    getPoitemsRemaining: builder.query<BaseResponse<Record<string, number>>, { ids: string[] }>({
      query: (arg) => ({
        url: `${DELIVERY_NOTE_URL}/poitems/remaining`,
        method: "POST",
        body: { ids: arg.ids },
        credentials: "include",
      }),
    }),

    // LIST with pagination support (page + limit + optional query)
    listDeliveryNotes: builder.query<
      BaseResponse<any>, // may be paginated object or raw array
      { page?: number; limit?: number; query?: string } | void
    >({
      query: (args) => {
        const page = (args && args.page) ?? 1;
        const limit = (args && args.limit) ?? 25;
        const query = args && args.query ? `&query=${encodeURIComponent(args.query)}` : "";
        return {
          url: `${DELIVERY_NOTE_URL}?page=${page}&limit=${limit}${query}`,
          method: "GET",
          credentials: "include",
        };
      },
      providesTags: (result) =>
        result
          ? [
            ...(((result.data ?? []) as any[]) || []).map((r) => ({
              type: "DeliveryNote" as const,
              id: r._id ?? r.id,
            })),
            { type: "DeliveryNote" as const, id: "LIST" },
          ]
          : [{ type: "DeliveryNote" as const, id: "LIST" }],
    }),

    getDeliveryNoteById: builder.query<BaseResponse<any>, string>({
      query: (id) => ({
        url: `${DELIVERY_NOTE_URL}/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error, id) => [{ type: "DeliveryNote", id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateDeliveryNoteMutation,
  useGetPoitemsRemainingQuery,
  useListDeliveryNotesQuery,
  useGetDeliveryNoteByIdQuery,
} = deliveryNoteApiSlice;
export default deliveryNoteApiSlice;
