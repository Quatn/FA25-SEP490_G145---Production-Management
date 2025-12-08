import { apiSlice } from "./apiSlice";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { PageResponse } from "@/types/DTO/PageResponse";
import { createApiEndpoint } from "@/utils/endpointFactory";
import { MANUFACTURING_ORDER_URL } from "../constants";
import { BaseResponse } from "@/types/DTO/BaseResponse";
import {
  CreateManyManufacturingOrdersRequestDto,
  CreateManyManufacturingOrdersResponseDto,
} from "@/types/DTO/manufacturing-order/CreateManyManufacturingOrdersDto";
import { DeleteManufacturingOrderRequestDto, DeleteManufacturingOrderResponseDto } from "@/types/DTO/manufacturing-order/DeleteManufacturingOrderDto";
import { UpdateManyManufacturingOrdersRequestDto, UpdateManyManufacturingOrdersResponseDto } from "@/types/DTO/manufacturing-order/UpdateManyManufacturingOrdersDto";
import { CorrugatorProcessStatus } from "@/types/enums/CorrugatorProcessStatus";

export const manufacturingOrderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getFullDetailManufacturingOrders: createApiEndpoint<
      PageResponse<Serialized<ManufacturingOrder>>,
      {
        page: number,
        limit: number,
        query?: string,
        corrugatorProcessStatuses?: CorrugatorProcessStatus[],
      }
    >(builder, {
      query: ({ page, limit, query, corrugatorProcessStatuses }) => ({
        url: `${MANUFACTURING_ORDER_URL}/query/full-details`,
        method: "GET",
        params: { page, limit, query, corrugatorProcessStatuses },
        credentials: "include",
      }),
      providesTags: ["ManufacturingOrder"],
      // mockFn: ({ page = 1, limit = 20 }) => mockManufacturingOrderQuery({ page, limit }),
    }),

    getDraftFullDetailManufacturingOrdersByPoiIds: createApiEndpoint<
      BaseResponse<Serialized<ManufacturingOrder>[]>,
      { ids: string[] }
    >(builder, {
      query: ({ ids }) => ({
        url: `${MANUFACTURING_ORDER_URL}/draft-orders-by-poi-ids`,
        method: "GET",
        params: { ids },
        credentials: "include",
      }),
      providesTags: ["ManufacturingOrder"],
    }),

    createManyManufacturingOrders: builder.mutation<
      CreateManyManufacturingOrdersResponseDto,
      CreateManyManufacturingOrdersRequestDto
    >({
      query: (body) => ({
        url: `${MANUFACTURING_ORDER_URL}/create-many`,
        method: "POST",
        body,
        credentials: "include",
      }),
      invalidatesTags: ["ManufacturingOrder"],
    }),

    updateManyManufacturingOrders: builder.mutation<
      UpdateManyManufacturingOrdersResponseDto,
      UpdateManyManufacturingOrdersRequestDto
    >({
      query: (body) => ({
        url: `${MANUFACTURING_ORDER_URL}/update-many`,
        method: "PATCH",
        body,
        credentials: "include",
      }),
      invalidatesTags: ["ManufacturingOrder"],
    }),

    deleteManufacturingOrder: builder.mutation<
      DeleteManufacturingOrderResponseDto,
      DeleteManufacturingOrderRequestDto
    >({
      query: (params) => ({
        url: `${MANUFACTURING_ORDER_URL}/id/${params.id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["ManufacturingOrder"],
    }),

    getAllManufacturingOrders: builder.query<{ success: boolean; message: string; data: ManufacturingOrder[] }, void>({
      query: () => ({
        url: `${MANUFACTURING_ORDER_URL}/list-all`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["ManufacturingOrder"],
    }),
  }),
});

export const {
  useGetFullDetailManufacturingOrdersQuery,
  useGetDraftFullDetailManufacturingOrdersByPoiIdsQuery,
  useCreateManyManufacturingOrdersMutation,
  useDeleteManufacturingOrderMutation,
  useUpdateManyManufacturingOrdersMutation,
  useGetAllManufacturingOrdersQuery,
} = manufacturingOrderApiSlice;
