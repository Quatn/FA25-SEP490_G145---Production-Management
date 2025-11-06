import { apiSlice } from "./apiSlice";
import { WARE_INFO_URL, USE_MOCK_DATA } from "../constants";
import { mockWareInfoQuery } from "../mock-data/functions/mock-ware-info-crud";

export const wareInfoApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWareInfo: builder.query({
      ...(USE_MOCK_DATA
        ? {
            queryFn: ({ page, limit }) => mockWareInfoQuery({ page, limit }),
          }
        : {
            query: ({ page = 1, limit = 20 }) => ({
              url: `${WARE_INFO_URL}/`,
              method: "GET",
              params: { page, limit },
              credentials: "include",
            }),
          }),
    }),
  }),
});

export const { useGetWareInfoQuery } = wareInfoApiSlice;
