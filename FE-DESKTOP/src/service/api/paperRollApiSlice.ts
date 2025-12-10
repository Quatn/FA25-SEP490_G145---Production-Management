// src/service/api/paperRollApiSlice.ts
import { apiSlice } from "./apiSlice";
import { BaseResponse, PaginatedList } from "@/types/DTO/Response";
import { PaperRoll } from "@/types/PaperRoll";
import { PAPER_ROLL_URL } from "../constants";

export const paperRollApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPaperRolls: builder.query<
      BaseResponse<PaginatedList<any>>, // aggregated documents (paperType, paperSupplier populated)
      { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: "asc" | "desc" }
    >({
      query: ({ page = 1, limit = 100, search = "", sortBy = "both", sortOrder = "desc" }) => ({
        url: `${PAPER_ROLL_URL}/list`,
        method: "GET",
        params: { page, limit, search, sortBy, sortOrder },
        credentials: "include",
      }),
      providesTags: ["PaperRoll"],
    }),

    getPaperRollDetail: builder.query<BaseResponse<any>, { id: string }>({
      query: ({ id }) => ({
        url: `${PAPER_ROLL_URL}/detail/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error, arg) => [{ type: "PaperRoll", id: arg.id }],
    }),

    createPaperRoll: builder.mutation<BaseResponse<any>, Partial<PaperRoll>>({
      query: (body) => ({
        url: `${PAPER_ROLL_URL}/create`,
        method: "POST",
        body,
        credentials: "include",
      }),
      invalidatesTags: ["PaperRoll"],
    }),

    createMultiplePaperRolls: builder.mutation<BaseResponse<any>, any>({
      query: (body) => ({
        url: `${PAPER_ROLL_URL}/create-multiple`,
        method: "POST",
        body,
        credentials: "include",
      }),
      invalidatesTags: ["PaperRoll"],
    }),

    updatePaperRoll: builder.mutation<BaseResponse<any>, { id: string; data: Partial<PaperRoll> }>({
      query: ({ id, data }) => ({
        url: `${PAPER_ROLL_URL}/update/${id}`,
        method: "PATCH",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["PaperRoll"],
    }),

    deletePaperRoll: builder.mutation<BaseResponse<any>, { id: string }>({
      query: ({ id }) => ({
        url: `${PAPER_ROLL_URL}/delete-soft/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["PaperRoll"],
    }),

    getDeletedPaperRolls: builder.query<BaseResponse<PaginatedList<any>>, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 100 }) => ({
        url: `${PAPER_ROLL_URL}/list-deleted`,
        method: "GET",
        params: { page, limit },
        credentials: "include",
      }),
      providesTags: ["PaperRoll"],
    }),

    restorePaperRoll: builder.mutation<BaseResponse<any>, { id: string }>({
      query: ({ id }) => ({
        url: `${PAPER_ROLL_URL}/restore/${id}`,
        method: "PATCH",
        credentials: "include",
      }),
      invalidatesTags: ["PaperRoll"],
    }),

    getInventoryByWarePaperTypeCodes: builder.query<
      BaseResponse<{code: string, weight: number}[]>, 
      { codes: string[] }
    >({
      query: ({ codes }) => ({
        url: `${PAPER_ROLL_URL}/inventory/by-ware-paper-type-codes`,
        method: "GET",
        params: { codes },
        credentials: "include",
      }),
      providesTags: ["PaperRoll"],
    }),

  }),
});

export const {
  useGetPaperRollsQuery,
  useGetPaperRollDetailQuery,
  useCreatePaperRollMutation,
  useCreateMultiplePaperRollsMutation,
  useUpdatePaperRollMutation,
  useDeletePaperRollMutation,
  useGetDeletedPaperRollsQuery,
  useRestorePaperRollMutation,
  useGetInventoryByWarePaperTypeCodesQuery,
} = paperRollApiSlice;
