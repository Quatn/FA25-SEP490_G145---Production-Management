import { apiSlice } from './apiSlice';
import { EMPLOYEE_URL } from '../constants';
import { createApiEndpoint } from '@/utils/endpointFactory';
import { PageResponse } from '@/types/DTO/PageResponse';
import { Employee } from '@/types/Employee';

export const employeeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: createApiEndpoint<
      PageResponse<Serialized<Employee>>,
      { page: number; limit: number, query?: string }
    >(builder, {
      query: ({ page, limit, query }) => ({
        url: `${EMPLOYEE_URL}/query/full-details`,
        method: "GET",
        params: { page, limit, query },
        credentials: "include",
      }),
      providesTags: ["Employee", "User"],
    }),

    // basically the same as the endpoint above but priorities employees with user
    getEmployeesForUserLists: createApiEndpoint<
      PageResponse<Serialized<Employee>>,
      { page: number; limit: number, query?: string }
    >(builder, {
      query: ({ page, limit, query }) => ({
        url: `${EMPLOYEE_URL}/query/get-employees-for-users-list`,
        method: "GET",
        params: { page, limit, query },
        credentials: "include",
      }),
      providesTags: ["Employee", "User"],
    }),
  }),
});

export const { useGetEmployeesQuery, useGetEmployeesForUserListsQuery } = employeeApiSlice;
