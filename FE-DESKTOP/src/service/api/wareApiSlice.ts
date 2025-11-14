import { apiSlice } from "./apiSlice";
import { USE_MOCK_DATA, WARE_URL } from "../constants";
import {
  mockWaresQuery,
  mockWaresQueryByCodes,
} from "../mock-data/functions/mock-catalog-crud";
import { PaginatedList, QueryResponse } from "@/types/DTO/Response";
import { Ware } from "@/types/Ware";

export const wareApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWares: builder.query({
      ...(USE_MOCK_DATA
        ? {
          queryFn: async (
            { page, limit }: { page: number; limit: number },
          ): Promise<
            QueryResponse<PaginatedList<Ware>>
          > => {
            try {
              const data = await mockWaresQuery({
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
            url: `${WARE_URL}/`,
            method: "GET",
            params: { page, limit },
            credentials: "include",
          }),
          transformResponse: (response: {
            data: Ware[];
            page: number;
            limit: number;
            total: number;
          }): PaginatedList<Ware> => {
            const totalPages = Math.max(1, Math.ceil((response.total || 0) / (response.limit || 1)));
            return {
              data: response.data,
              page: response.page,
              limit: response.limit,
              totalItems: response.total,
              totalPages,
              hasNextPage: response.page < totalPages,
              hasPrevPage: response.page > 1,
            };
          },
        }),
    }),

    getWaresByCodes: builder.query({
      ...(USE_MOCK_DATA
        ? {
          queryFn: async (
            { page, limit, codes }: {
              page: number;
              limit: number;
              codes: string[];
            },
          ): Promise<
            QueryResponse<PaginatedList<Ware>>
          > => {
            try {
              const data = await mockWaresQueryByCodes({
                page,
                limit,
                codes,
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
          query: ({ codes = [], page = 1, limit = 20 }) => ({
            url: `${WARE_URL}/`,
            method: "GET",
            params: { codes, page, limit },
            credentials: "include",
          }),
        }),
    }),
  }),
});

export const {
  useGetWaresQuery,
  useGetWaresByCodesQuery,
} = wareApiSlice;
