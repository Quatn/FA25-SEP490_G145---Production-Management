// src/service/api/printColorApiSlice.ts
import { apiSlice } from "./apiSlice";
import { PRINT_COLOR_URL } from "../constants";

export const printColorApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllPrintColors: builder.query<any[], void>({
      query: () => ({ url: `${PRINT_COLOR_URL}/list-all`, method: "GET", credentials: "include" }),
      providesTags: ["PrintColor"],
    }),
  }),
});

export const { useGetAllPrintColorsQuery } = printColorApiSlice;
