import { apiSlice } from "./apiSlice";
import { PAPER_COLOR_URL, PAPER_GRAMMAGE_URL, PAPER_SUPPLIER_URL, PAPER_WIDTH_URL, USE_MOCK_DATA } from "../constants";
import { mockPaperSupplierQuery } from "../mock-data/functions/mock-paper-supplier-crud";
import { mockPaperColorQuery } from "../mock-data/functions/mock-paper-color-crud";
import { mockPaperGrammageQuery } from "../mock-data/functions/mock-paper-grammage-crud";
import { mockPaperWidthQuery } from "../mock-data/functions/mock-paper-width-crud";
import { PaperColor, PaperSupplier, PaperSuppliersResponse } from "@/types/paperStorage.types";

export const paperRollStorageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPaperSuppliers: builder.query<PaperSuppliersResponse, { page: number, limit: number }>({
      ...(USE_MOCK_DATA
        ? {
          queryFn: ({ page, limit }) => mockPaperSupplierQuery({ page, limit }),
        }
        : {
          query: ({ page = 1, limit = 20 }) => ({
            url: `${PAPER_SUPPLIER_URL}/messages`,
            method: "GET",
            params: { page, limit },
            credentials: "include",
          }),
        }),
    }),

    addPaperSuppliers: builder.mutation<{ success: boolean; message: string }, PaperSupplier | PaperSupplier[]>({
      ...(USE_MOCK_DATA
        ? {
          queryFn: async (body) => {
            console.log("Mock add suppliers", body);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            //success case
            return { data: { success: true, message: "Mock added successully" } };

            //error case
            // return {
            //   error: {
            //     status: 404,
            //     data: { message: "Mock failed" },
            //   },
            // };
          },
        } : {
          query: (body) => ({
            url: `${PAPER_SUPPLIER_URL}/messages`,
            method: "POST",
            body,
            credentials: "include",
          }),
        })
    }),

    updatePaperSupplier: builder.mutation<{ success: boolean; message: string }, PaperSupplier>({
      ...(USE_MOCK_DATA
        ? {
          queryFn: async (body) => {
            console.log("Mock updatePaperSupplier", body);
            await new Promise((resolve) => setTimeout(resolve, 1000));

            //success case
            return { data: { success: true, message: "Mock updated successfully" } };

            //error case
            // return {
            //   error: {
            //     status: 404,
            //     data: { message: "Mock failed" },
            //   },
            // };
          },
        }
        : {
          query: (body) => ({
            url: `${PAPER_SUPPLIER_URL}/messages/${body._id}`,
            method: "PUT",
            body,
            credentials: "include",
          }),
        }),
    }),

    deletePaperSupplier: builder.mutation<{ success: boolean; message: string }, string>({
      ...(USE_MOCK_DATA
        ? {
          queryFn: async (code) => {
            console.log("Mock deletePaperSupplier", code);
            await new Promise((resolve) => setTimeout(resolve, 1000));

            //success case
            return { data: { success: true, message: "Mock deleted successfully" } };

            // error case 
            // return {
            //   error: {
            //     status: 404,
            //     data: { message: "Mock delete failed" },
            //   },
            // };
          },
        }
        : {
          // Real API
          query: (code) => ({
            url: `${PAPER_SUPPLIER_URL}/messages/${code}`,
            method: "DELETE",
            credentials: "include",
          }),
        }),
    }),

    getPaperColors: builder.query({
      ...(USE_MOCK_DATA
        ? {
          queryFn: (
            { page, limit }: { page: number; limit: number },
          ) => mockPaperColorQuery({ page, limit }),
        }
        : {
          query: ({ page = 1, limit = 20 }) => ({
            url: `${PAPER_COLOR_URL}/messages`,
            method: "GET",
            params: { page, limit },
            credentials: "include",
          }),
        }),
    }),

    addPaperColors: builder.mutation<{ success: boolean; message: string },PaperColor | PaperColor[]>({
      ...(USE_MOCK_DATA
        ? {
            queryFn: async (body) => {
              console.log("Mock add paper colors", body);
              await new Promise((resolve) => setTimeout(resolve, 1000));
              // success
              return { data: { success: true, message: "Mock added successfully" } };
              // error example:
              // return { error: { status: 404, data: { message: "Mock failed" } } };
            },
          }
        : {
            query: (body) => ({
              url: `${PAPER_COLOR_URL}`,
              method: "POST",
              body,
              credentials: "include",
            }),
          }),
    }),

    updatePaperColor: builder.mutation<{ success: boolean; message: string },PaperColor>({
      ...(USE_MOCK_DATA
        ? {
            queryFn: async (body) => {
              console.log("Mock update paper color", body);
              await new Promise((resolve) => setTimeout(resolve, 1000));
              return { data: { success: true, message: "Mock updated successfully" } };
            },
          }
        : {
            query: (body) => ({
              url: `${PAPER_COLOR_URL}/${body._id?.$oid}`,
              method: "PUT",
              body,
              credentials: "include",
            }),
          }),
    }),

    deletePaperColor: builder.mutation<{ success: boolean; message: string },string>({
      ...(USE_MOCK_DATA
        ? {
            queryFn: async (code) => {
              console.log("Mock delete paper color", code);
              await new Promise((resolve) => setTimeout(resolve, 1000));
              return { data: { success: true, message: "Mock deleted successfully" } };
            },
          }
        : {
            query: (code) => ({
              url: `${PAPER_COLOR_URL}/${code}`,
              method: "DELETE",
              credentials: "include",
            }),
          }),
    }),

    getPaperWidth: builder.query({
      ...(USE_MOCK_DATA
        ? {
          queryFn: (
            { page, limit }: { page: number; limit: number },
          ) => mockPaperWidthQuery({ page, limit }),
        }
        : {
          query: ({ page = 1, limit = 20 }) => ({
            url: `${PAPER_WIDTH_URL}/messages`,
            method: "GET",
            params: { page, limit },
            credentials: "include",
          }),
        }),
    }),

    getPaperGrammage: builder.query({
      ...(USE_MOCK_DATA
        ? {
          queryFn: (
            { page, limit }: { page: number; limit: number },
          ) => mockPaperGrammageQuery({ page, limit }),
        }
        : {
          query: ({ page = 1, limit = 20 }) => ({
            url: `${PAPER_GRAMMAGE_URL}/messages`,
            method: "GET",
            params: { page, limit },
            credentials: "include",
          }),
        }),
    }),

  }),
});

export const {
  useGetPaperSuppliersQuery,
  useAddPaperSuppliersMutation,
  useUpdatePaperSupplierMutation,
  useDeletePaperSupplierMutation,
  useGetPaperColorsQuery,
  useGetPaperWidthQuery,
  useGetPaperGrammageQuery,
  useAddPaperColorsMutation,
  useUpdatePaperColorMutation,
  useDeletePaperColorMutation,
} = paperRollStorageApiSlice;
