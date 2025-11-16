// src/service/api/manufacturingProcessApiSlice.ts
import { apiSlice } from "./apiSlice";
import { MANUFACTURING_PROCESS_URL } from "../constants";

export const manufacturingProcessApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllManufacturingProcesses: builder.query<any[], void>({
      query: () => ({ url: `${MANUFACTURING_PROCESS_URL}/list-all`, method: "GET", credentials: "include" }),
      providesTags: ["ManufacturingProcess"],
    }),
  }),
});

export const { useGetAllManufacturingProcessesQuery } = manufacturingProcessApiSlice;
