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
      invalidatesTags: ["Ware", "PurchaseOrderItem", "ManufacturingOrder"],
    }),
    deleteWare: builder.mutation<BaseResponse<any>, { id: string }>({
      query: ({ id }) => ({ url: `${WARE_URL}/delete-soft/${id}`, method: "DELETE", credentials: "include" }),
      invalidatesTags: ["Ware", "PurchaseOrderItem", "ManufacturingOrder"],
    }),
    getDeletedWares: builder.query<PaginatedList<Ware>, GetWaresParams>({
      query: ({ page = 1, limit = 20, search = "" } = {}) => ({
        url: `${WARE_URL}/deleted`,
        method: "GET",
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
        },
        credentials: "include",
      }),
      transformResponse: (response: any): PaginatedList<Ware> => {
        const resp = response ?? {};
        const dataArr: any[] =
          Array.isArray(resp.data) ? resp.data : Array.isArray(resp) ? resp : resp?.data?.data ?? [];
        const pageNum = Number(resp.page ?? resp?.page ?? 1);
        const lim = Number(resp.limit ?? resp?.limit ?? 20);
        const totalItems =
          Number(resp.totalItems ?? resp.total ?? resp?.data?.total ?? dataArr.length) || 0;
        const totalPages = Math.max(1, Math.ceil((totalItems || 0) / (lim || 1)));

        return {
          data: dataArr,
          page: pageNum,
          limit: lim,
          totalItems,
          totalPages,
          hasNextPage: resp.hasNextPage ?? pageNum < totalPages,
          hasPrevPage: resp.hasPrevPage ?? pageNum > 1,
        };
      },
      providesTags: (result) => {
        const arr =
          (result && Array.isArray((result as any).data) && (result as any).data) ||
          (result && Array.isArray(result.data?.data) && result.data.data) ||
          (result && Array.isArray((result as any).data?.data) && result.data.data) ||
          (result && Array.isArray((result as any).data?.items) && result.data.items) ||
          (result && Array.isArray((result as any).data) && result.data) ||
          (result && Array.isArray((result as any).data?.data) && result.data.data) ||
          (result && Array.isArray((result as any).data) && result.data) ||
          (result && Array.isArray((result as any).data) && result.data) ||
          [];

        if (arr && arr.length > 0) {
          return [
            ...arr.map((r: any) => ({
              type: "Ware" as const,
              id: r._id ?? r.id ?? r.code,
            })),
            { type: "Ware" as const, id: "DELETED_LIST" },
          ];
        }
        return [{ type: "Ware" as const, id: "DELETED_LIST" }];
      },
    }),

    restoreWare: builder.mutation<BaseResponse<any>, string>({
      query: (id: string) => ({
        url: `${WARE_URL}/${id}/restore`,
        method: "PATCH",
        credentials: "include",
      }),
      invalidatesTags: [{ type: "Ware", id: "DELETED_LIST" }, { type: "Ware", id: "LIST" }, "PurchaseOrderItem", "ManufacturingOrder"],
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
  useGetDeletedWaresQuery,
  useRestoreWareMutation,
} = wareApiSlice;
