import { apiSlice } from "./apiSlice";
import { USE_MOCK_DATA, WARE_URL } from "../constants";
import {
  mockWaresQuery,
  mockWaresQueryByCodes,
} from "../mock-data/functions/mock-catalog-crud";
import { Ware } from "@/types/Ware";
import { createApiEndpoint } from "@/utils/endpointFactory";
import { PageResponse } from "@/types/DTO/PageResponse";
import { BaseResponse, PaginatedList, QueryResponse } from "@/types/DTO/Response";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

type GetWaresParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export const wareApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWares: builder.query<PaginatedList<Ware>, GetWaresParams>({
      ...(USE_MOCK_DATA
        ? {
          queryFn: async (
            { page = 1, limit = 20 }: GetWaresParams,
          ): Promise<
            QueryResponse<PaginatedList<Ware>, FetchBaseQueryError>
          > => {
            try {
              const data = await mockWaresQuery({
                page: page || 1,
                limit: limit || 20,
              });
              return {
                data: data as unknown as PaginatedList<Ware>,
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
          query: ({ page = 1, limit = 20, search }) => ({
            url: `${WARE_URL}/`,
            method: "GET",
            params: {
              page,
              limit,
              ...(search ? { search } : {}),
            },
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

    // Note: This endpoint may not exist in backend yet
    getWaresByCodes: builder.query<
      PaginatedList<Ware>,
      { page?: number; limit?: number; codes: string[] }
    >({
      queryFn: async ({ page = 1, limit = 20, codes }): Promise<
        QueryResponse<PaginatedList<Ware>, FetchBaseQueryError>
      > => {
        if (USE_MOCK_DATA) {
          try {
            const data = await mockWaresQueryByCodes({ page, limit, codes });
            return { data: data as unknown as PaginatedList<Ware> };
          } catch (err) {
            return {
              error: {
                status: "CUSTOM_ERROR",
                error: (err as Error).message,
              } as unknown as FetchBaseQueryError,
            };
          }
        }
        // TODO: Implement real API call when backend endpoint is available
        return {
          error: {
            status: "CUSTOM_ERROR",
            error: "Endpoint not implemented",
          } as unknown as FetchBaseQueryError,
        };
      },
    }),

    getAllWares: builder.query<BaseResponse<any[]>, void>({
      query: () => ({ url: `${WARE_URL}/list-all`, method: "GET", credentials: "include" }),
      providesTags: ["Ware"],
    }),
    getWareDetail: builder.query<BaseResponse<any>, { id: string }>({
      query: ({ id }) => ({ url: `${WARE_URL}/detail/${id}`, method: "GET", credentials: "include" }),
      providesTags: (res, err, arg) => [{ type: "Ware", id: arg.id }],
    }),
    createWare: builder.mutation<BaseResponse<any>, any>({
      query: (body) => ({ url: `${WARE_URL}/create`, method: "POST", body, credentials: "include" }),
      invalidatesTags: ["Ware"],
    }),
    updateWare: builder.mutation<BaseResponse<any>, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `${WARE_URL}/update/${id}`, method: "PATCH", body: data, credentials: "include" }),
      invalidatesTags: ["Ware"],
    }),
    deleteWare: builder.mutation<BaseResponse<any>, { id: string }>({
      query: ({ id }) => ({ url: `${WARE_URL}/delete-soft/${id}`, method: "DELETE", credentials: "include" }),
      invalidatesTags: ["Ware"],
    }),
    restoreWare: builder.mutation<BaseResponse<any>, { id: string }>({
      query: ({ id }) => ({ url: `${WARE_URL}/restore/${id}`, method: "PATCH", credentials: "include" }),
      invalidatesTags: ["Ware"],
    }),
    getDeletedWares: builder.query<BaseResponse<PaginatedList<any>>, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 100 }) => ({ url: `${WARE_URL}/list-deleted`, method: "GET", params: { page, limit }, credentials: "include" }),
      providesTags: ["Ware"],
    }),
  }),
});

export const {
  useGetWaresQuery,
  useGetWaresByCodesQuery,
  useGetAllWaresQuery,
  useGetWareDetailQuery,
  useCreateWareMutation,
  useUpdateWareMutation,
  useDeleteWareMutation,
  useRestoreWareMutation,
  useGetDeletedWaresQuery,
} = wareApiSlice;
