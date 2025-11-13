import { apiSlice } from "./apiSlice";
import {
  mockManufacturingOrderQuery,
} from "../mock-data/functions/mock-manufacturing-orders-crud";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { PageResponse } from "@/types/DTO/PageResponse";
import { createApiEndpoint } from "@/utils/endpointFactory";
import { MANUFACTURING_ORDER_URL } from "../constants";
import { BaseResponse } from "@/types/DTO/BaseResponse";

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
      mockFn: ({ page = 1, limit = 20 }) =>
        mockManufacturingOrderQuery({ page, limit }),
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
      mockFn: ({ page = 1, limit = 20 }) =>
        mockManufacturingOrderQuery({ page, limit }),
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
    }),
  }),
});

export const {
  useGetManufacturingOrdersQuery,
  useGetFullDetailManufacturingOrdersQuery,
  useGetDraftFullDetailManufacturingOrdersByPoiIdsQuery,
} = manufacturingOrderApiSlice;
