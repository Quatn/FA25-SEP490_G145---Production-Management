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
  useGetManufacturingOrdersQuery,
  useGetFullDetailManufacturingOrdersQuery,
  useGetDraftFullDetailManufacturingOrdersByPoiIdsQuery,
  useGetAllManufacturingOrdersQuery,
} = manufacturingOrderApiSlice;
