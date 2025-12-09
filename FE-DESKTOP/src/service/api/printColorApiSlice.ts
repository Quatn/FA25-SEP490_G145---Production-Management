import { apiSlice } from "./apiSlice";
import { BaseResponse, PaginatedList } from "@/types/DTO/Response";
import { PrintColor } from "@/types/PrintColor";
import { PRINT_COLOR_URL } from "../constants";

export const printColorApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getAllPrintColors: builder.query<{ success: boolean; message: string; data: PrintColor[] }, void>({
      query: () => ({
        url: `${PRINT_COLOR_URL}/list-all`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["PrintColor"],
    }),

    getPrintColor: builder.query<BaseResponse<PaginatedList<PrintColor>>, { page?: number; limit?: number; search?: string }>(
      {
        query: ({ page = 1, limit = 10, search = "" }) => ({
          url: `${PRINT_COLOR_URL}/list`,
          method: "GET",
          params: { page, limit, search },
          credentials: "include",
        }),
        providesTags: ["PrintColor"],
      }
    ),

    getDeletedPrintColor: builder.query<BaseResponse<PaginatedList<PrintColor>>, { page?: number; limit?: number }>(
      {
        query: ({ page = 1, limit = 10 }) => ({
          url: `${PRINT_COLOR_URL}/list-deleted`,
          method: "GET",
          params: { page, limit },
          credentials: "include",
        }),
        providesTags: ["PrintColor"],
      }
    ),

    addPrintColor: builder.mutation<{ success: boolean; message: string }, PrintColor>({
      query: (body) => ({
        url: `${PRINT_COLOR_URL}/create`,
        method: "POST",
        body,
        credentials: "include",
      }),
      invalidatesTags: ["PrintColor"],
    }),

    updatePrintColor: builder.mutation<{ success: boolean; message: string }, PrintColor>({
      query: (body) => ({
        url: `${PRINT_COLOR_URL}/update/${body._id}`,
        method: "PATCH",
        body,
        credentials: "include",
      }),
      invalidatesTags: ["PrintColor"],
    }),

    deleteSoftPrintColor: builder.mutation<{ success: boolean; message: string }, PrintColor>({
      query: (body) => {
        const id = body._id;
        return {
          url: `${PRINT_COLOR_URL}/delete-soft/${id}`,
          method: "DELETE",
          credentials: "include",
        };
      },
      invalidatesTags: ["PrintColor"],
    }),

    deleteHardPrintColor: builder.mutation<{ success: boolean; message: string }, PrintColor>({
      query: (body) => {
        const id = body._id;
        return {
          url: `${PRINT_COLOR_URL}/delete-hard/${id}`,
          method: "DELETE",
          credentials: "include",
        };
      },
      invalidatesTags: ["PrintColor"],
    }),

    restorePrintColor: builder.mutation<{ success: boolean; message: string }, PrintColor>({
      query: (body) => {
        const id = body._id;
        return {
          url: `${PRINT_COLOR_URL}/restore/${id}`,
          method: "PATCH",
          credentials: "include",
        };
      },
      invalidatesTags: ["PrintColor"],
    }),

  }),
});

export const {
  useGetAllPrintColorsQuery,
  useAddPrintColorMutation,
  useGetPrintColorQuery,
  useGetDeletedPrintColorQuery,
  useUpdatePrintColorMutation,
  useDeleteSoftPrintColorMutation,
  useRestorePrintColorMutation,
  useDeleteHardPrintColorMutation,
} = printColorApiSlice;

