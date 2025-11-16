import { apiSlice } from "./apiSlice";
import {
  mockManufacturingOrderQuery,
} from "../mock-data/functions/mock-manufacturing-orders-crud";
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

export const manufacturingOrderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getManufacturingOrders: createApiEndpoint<
      PageResponse<Serialized<ManufacturingOrder>>,
      { page: number; limit: number }
    >(builder, {
      query: ({ page, limit }) => ({
        url: `${MANUFACTURING_ORDER_URL}/query/full-details`,
        method: "GET",
        params: { page, limit },
        credentials: "include",
      }),
      providesTags: ["ManufacturingOrder"],
      // mockFn: ({ page = 1, limit = 20 }) => mockManufacturingOrderQuery({ page, limit }),
    }),

    getFullDetailManufacturingOrders: createApiEndpoint<
      PageResponse<Serialized<ManufacturingOrder>>,
      { page: number; limit: number }
    >(builder, {
      query: ({ page, limit }) => ({
        url: `${MANUFACTURING_ORDER_URL}/query/full-details`,
        method: "GET",
        params: { page, limit },
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
  }),
});

export const {
  useGetManufacturingOrdersQuery,
  useGetFullDetailManufacturingOrdersQuery,
  useGetDraftFullDetailManufacturingOrdersByPoiIdsQuery,
  useCreateManyManufacturingOrdersMutation,
  useDeleteManufacturingOrderMutation,
  useUpdateManyManufacturingOrdersMutation,
} = manufacturingOrderApiSlice;
