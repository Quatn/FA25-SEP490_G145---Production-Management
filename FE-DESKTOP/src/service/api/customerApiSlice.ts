import { apiSlice } from './apiSlice';
import { BaseResponse } from "@/types/DTO/Response";
import { Customer } from "@/types/Customer";
import { CUSTOMER_URL } from '../constants';
import { PaginatedList } from '@/types/DTO/PaginatedList';

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

    getCustomer: builder.query<BaseResponse<PaginatedList<Customer>>, { page?: number; limit?: number, search?: string }>(
      {
        query: ({ page = 1, limit = 10, search = '' }) => ({
          url: `${CUSTOMER_URL}/list`,
          method: "GET",
          params: { page, limit, search },
          credentials: "include",
        }),
        providesTags: ["Customer"],
      }),

    getDeletedCustomer: builder.query<BaseResponse<PaginatedList<Customer>>, { page?: number; limit?: number }>(
      {
        query: ({ page = 1, limit = 10 }) => ({
          url: `${CUSTOMER_URL}/list-deleted`,
          method: "GET",
          params: { page, limit },
          credentials: "include",
        }),
        providesTags: ["Customer"],
      }),

    addCustomer: builder.mutation<{ success: boolean; message: string }, Customer>({
      query: (body) => ({
        url: `${CUSTOMER_URL}/create`,
        method: "POST",
        body,
        credentials: "include",
      }),
      invalidatesTags: ["Customer"],
    }),

    updateCustomer: builder.mutation<{ success: boolean; message: string }, Customer>({
      query: (body) => ({
        url: `${CUSTOMER_URL}/update/${body._id}`,
        method: "PATCH",
        body,
        credentials: "include",
      }),
      invalidatesTags: ["Customer"],
    }),

    deleteCustomer: builder.mutation<{ success: boolean; message: string }, Customer>({
      query: (body) => ({
        url: `${CUSTOMER_URL}/delete-soft/${body._id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["Customer"],
    }),

    deleteHardCustomer: builder.mutation<{ success: boolean; message: string }, Customer>({
      query: (body) => {
        const id = body._id;
        return {
          url: `${CUSTOMER_URL}/delete-hard/${id}`,
          method: "DELETE",
          credentials: "include",
        };
      },
      invalidatesTags: ["Customer"],
    }),

    restoreCustomer: builder.mutation<{ success: boolean; message: string }, Customer>({
      query: (body) => {
        const id = body._id;
        return {
          url: `${CUSTOMER_URL}/restore/${id}`,
          method: "PATCH",
          credentials: "include",
        };
      },
      invalidatesTags: ["Customer"],
    }),
  }),
});

export const {
  useGetAllCustomersQuery,
  useAddCustomerMutation,
  useDeleteCustomerMutation,
  useDeleteHardCustomerMutation,
  useGetCustomerQuery,
  useGetDeletedCustomerQuery,
  useUpdateCustomerMutation,
  useRestoreCustomerMutation,
} = customerApiSlice;