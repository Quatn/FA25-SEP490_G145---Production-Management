import { GetOrderFinishingProcessDto, OrderFinishingProcess } from "@/types/OrderFinishingProcess";
import { ORDER_FINISHING_PROCESS_URL } from "../constants";
import { apiSlice } from "./apiSlice";
import { BaseResponse, PaginatedList } from "@/types/DTO/Response";
import { createApiEndpoint } from "@/utils/endpointFactory";

export const OrderFinishingProcessApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getOrderFinishingProcesss: builder.query<
            BaseResponse<PaginatedList<OrderFinishingProcess>>,
            GetOrderFinishingProcessDto
        >({
            query: (GetOrderFinishingProcessDto) => ({
                url: `${ORDER_FINISHING_PROCESS_URL}/list`,
                method: "GET",
                params: GetOrderFinishingProcessDto,
                credentials: "include",
            }),
            providesTags: ["OrderFinishingProcess", "ManufacturingOrder"],
        }),

        getOrderFinishingProcessDetail: builder.query<BaseResponse<OrderFinishingProcess>, { id: string }>({
            query: ({ id }) => ({
                url: `${ORDER_FINISHING_PROCESS_URL}/detail/${id}`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["OrderFinishingProcess"],
        }),

        createOrderFinishingProcess: builder.mutation<BaseResponse<OrderFinishingProcess>, Partial<OrderFinishingProcess>>({
            query: (body) => ({
                url: `${ORDER_FINISHING_PROCESS_URL}/create`,
                method: "POST",
                body,
                credentials: "include",
            }),
            invalidatesTags: ["OrderFinishingProcess"],
        }),

        updateOrderFinishingProcess: builder.mutation<BaseResponse<OrderFinishingProcess>, { id: string; data: Partial<OrderFinishingProcess> }>({
            query: ({ id, data }) => ({
                url: `${ORDER_FINISHING_PROCESS_URL}/update/${id}`,
                method: "PATCH",
                body: data,
                credentials: "include",
            }),
            invalidatesTags: ["OrderFinishingProcess"],
        }),

        updateManyOrderFinishingProcess: builder.mutation<
            BaseResponse<{ matched: number, modified: number }>, // Returns { success: true, data: { matched: n, modified: n } }
            { ids: string[]; data: Partial<OrderFinishingProcess> }
        >({
            query: ({ ids, data }) => ({
                url: `${ORDER_FINISHING_PROCESS_URL}/update-many`,
                method: "PATCH",
                body: {
                    ids,
                    data
                },
                credentials: "include",
            }),
            invalidatesTags: ["OrderFinishingProcess"],
        }),

        deleteOrderFinishingProcess: builder.mutation<BaseResponse<OrderFinishingProcess>, { id: string }>({
            query: ({ id }) => ({
                url: `${ORDER_FINISHING_PROCESS_URL}/delete-soft/${id}`,
                method: "DELETE",
                credentials: "include",
            }),
            invalidatesTags: ["OrderFinishingProcess"],
        }),

        restoreOrderFinishingProcess: builder.mutation<BaseResponse<OrderFinishingProcess>, { id: string }>({
            query: ({ id }) => ({
                url: `${ORDER_FINISHING_PROCESS_URL}/restore/${id}`,
                method: "PATCH",
                credentials: "include",
            }),
            invalidatesTags: ["OrderFinishingProcess"],
        }),

    findManyOrderFinishingProcesssByManufacturingOrderId: createApiEndpoint<
    BaseResponse<Serialized<OrderFinishingProcess>[]>,
    { orders: string[] }
    >(builder, {
      query: ({ orders }) => ({
        url: `${ORDER_FINISHING_PROCESS_URL}/find-by-manufacturing-order-id`,
        method: "GET",
        params: { orders },
        credentials: "include",
      }),
      providesTags: ["OrderFinishingProcess", "ManufacturingOrder"],
    }),

  }),
});

export const {
    useGetOrderFinishingProcesssQuery,
    useGetOrderFinishingProcessDetailQuery,
    useCreateOrderFinishingProcessMutation,
    useUpdateOrderFinishingProcessMutation,
    useUpdateManyOrderFinishingProcessMutation,
    useDeleteOrderFinishingProcessMutation,
    useRestoreOrderFinishingProcessMutation,
  useFindManyOrderFinishingProcesssByManufacturingOrderIdQuery,
} = OrderFinishingProcessApiSlice;
