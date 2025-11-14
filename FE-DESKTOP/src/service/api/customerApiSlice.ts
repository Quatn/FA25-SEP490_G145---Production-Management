import { apiSlice } from "./apiSlice";
import { BaseResponse } from "@/types/DTO/Response";
import { Customer } from "@/types/Customer";
import { CUSTOMER_URL } from "../constants";

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
  }),
});

export const { useGetAllCustomersQuery } = customerApiSlice;

