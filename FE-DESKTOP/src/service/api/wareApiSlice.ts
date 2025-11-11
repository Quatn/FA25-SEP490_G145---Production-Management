import { apiSlice } from "./apiSlice";
import { USE_MOCK_DATA, WARE_URL } from "../constants";
import {
  mockWaresQuery,
  mockWaresQueryByCodes,
} from "../mock-data/functions/mock-catalog-crud";
import { Ware } from "@/types/Ware";
import { createApiEndpoint } from "@/utils/endpointFactory";
import { PageResponse } from "@/types/DTO/PageResponse";

export const wareApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWares: createApiEndpoint<
      PageResponse<Serialized<Ware>>,
      { page: number; limit: number }
    >(builder, {
      query: ({ page, limit }) => ({
        url: `${WARE_URL}/`,
        method: "GET",
        params: { page, limit },
        credentials: "include",
      }),
      mockFn: ({ page = 1, limit = 20 }) => mockWaresQuery({ page, limit }),
    }),

    getWaresByCodes: createApiEndpoint<
      PageResponse<Serialized<Ware>>,
      { page: number; limit: number; codes: string[] }
    >(builder, {
      query: ({ page, limit, codes }) => ({
        url: `${WARE_URL}/codes`,
        method: "GET",
        params: { page, limit, codes },
        credentials: "include",
      }),
      mockFn: ({ page = 1, limit = 20, codes }) =>
        mockWaresQueryByCodes({ page, limit, codes }),
    }),
  }),
});

export const {
  useGetWaresQuery,
  useGetWaresByCodesQuery,
} = wareApiSlice;
