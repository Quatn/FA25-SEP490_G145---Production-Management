import { apiSlice } from "./apiSlice";
import {
  mockManufacturingOrderQuery,
} from "../mock-data/functions/mock-manufacturing-orders-crud";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { PageResponse } from "@/types/DTO/PageResponse";
import { createApiEndpoint } from "@/utils/endpointFactory";
import { MANUFACTURING_ORDER_URL } from "../constants";

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
    /*
    getFullDetailManufacturingOrders: builder.query<
      PageResponse<Serialized<ManufacturingOrder>>,
      { page: number; limit: number }
    >({
      ...(USE_MOCK_DATA
        ? {
          queryFn: async (
            { page, limit }: { page: number; limit: number },
          ): Promise<
            MockResponse<PageResponse<Serialized<ManufacturingOrder>>>
          > => {
            try {
              const data = await mockFullDetailManufacturingOrderQuery({
                page,
                limit,
              });

              return {
                data,
              };
            } catch (err) {
              return {
                error: {
                  status: "CUSTOM_ERROR",
                  error: (err as Error).message,
                },
              };
            }
          },
        }
        : {
          query: ({ page = 1, limit = 20 }) => ({
            url: `${MANUFACTURING_ORDER_URL}/query/full-details`,
            method: "GET",
            params: { page, limit },
            credentials: "include",
          }),
        }),
    }),
  */
  }),
});

export const {
  useGetManufacturingOrdersQuery,
  useGetFullDetailManufacturingOrdersQuery,
} = manufacturingOrderApiSlice;
