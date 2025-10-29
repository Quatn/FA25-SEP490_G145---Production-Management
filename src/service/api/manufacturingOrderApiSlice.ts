import { apiSlice } from "./apiSlice";
import { MANUFACTURING_ORDER_URL, USE_MOCK_DATA } from "../constants";
import {
  mockFullDetailManufacturingOrderQuery,
  mockManufacturingOrderQuery,
} from "../mock-data/functions/mock-manufacturing-orders-crud";
import { FullDetailManufacturingOrderDTO } from "@/types/DTO/FullDetailManufactureOrder";
import { PaginatedList, QueryResponse } from "@/types/DTO/Response";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";

export const manufacturingOrderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getManufacturingOrders: builder.query({
      ...(USE_MOCK_DATA
        ? {
          queryFn: async (
            { page, limit }: { page: number; limit: number },
          ): Promise<
            QueryResponse<PaginatedList<ManufacturingOrder>>
          > => {
            try {
              const data = await mockManufacturingOrderQuery({
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
            url: `${MANUFACTURING_ORDER_URL}/`,
            method: "GET",
            params: { page, limit },
            credentials: "include",
          }),
        }),
    }),

    getFullDetailManufacturingOrders: builder.query({
      ...(USE_MOCK_DATA
        ? {
          queryFn: async (
            { page, limit }: { page: number; limit: number },
          ): Promise<
            QueryResponse<PaginatedList<FullDetailManufacturingOrderDTO>>
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
            url: `${MANUFACTURING_ORDER_URL}/full-detail`,
            method: "GET",
            params: { page, limit },
            credentials: "include",
          }),
        }),
    }),
  }),
});

export const {
  useGetManufacturingOrdersQuery,
  useGetFullDetailManufacturingOrdersQuery,
} = manufacturingOrderApiSlice;
