// src/service/api/customerApiSlice.ts
import { apiSlice } from './apiSlice';
import { BaseResponse } from "@/types/DTO/Response";
import { Customer } from "@/types/Customer";
import { CUSTOMER_URL } from '../constants'; // define if not present

export const customerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCustomers: builder.query<
      BaseResponse<Customer[]>,
      void
    >({
      query: () => ({
        url: `${CUSTOMER_URL}/list-all`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Customer"],
    }),
    getCustomers: builder.query<any, { page?: number; limit?: number; search?: string }>({
      query: ({ page = 1, limit = 10, search = '' }) => ({
        url: `${CUSTOMER_URL}/list`,
        method: 'GET',
        params: { page, limit, search },
        credentials: 'include',
      }),
      providesTags: ['Customer'],
    }),
  }),
});

export const { useGetAllCustomersQuery, useGetCustomersQuery } = customerApiSlice;