import { apiSlice } from "./apiSlice";
import { WARE_URL, USE_MOCK_DATA } from "../constants";
import { mockWaresQuery, mockWaresQueryByCodes } from "../mock-data/functions/mock-catalog-crud";

export const wareApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWares: builder.query({
      ...(USE_MOCK_DATA
        ? {
          queryFn: (
            { page, limit }: { page: number; limit: number },
          ) => mockWaresQuery({ page, limit }),
        }
        : {
          query: ({ page = 1, limit = 20 }) => ({
            url: `${WARE_URL}/`,
            method: "GET",
            params: { page, limit },
            credentials: "include",
          }),
        }),
    }),

    getWaresByCodes: builder.query({
      ...(USE_MOCK_DATA
        ? {
          queryFn: (
            { codes, page, limit }: { codes: string[], page: number; limit: number },
          ) => mockWaresQueryByCodes({ codes, page, limit }),
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
