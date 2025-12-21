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

    getDeletedEmployees: builder.query<any, { page: number; limit: number; query?: string }>(
      {
        query: ({ page, limit, query }) => ({
          url: `${EMPLOYEE_URL}/query/deleted`,
          method: "GET",
          params: { page, limit, query },
          credentials: "include",
        }),
        providesTags: [{ type: "Employee", id: "DELETED_LIST" }],
      },
    ),

    getEmployeeById: builder.query<any, string>({
      query: (id) => ({
        url: `${EMPLOYEE_URL}/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error, id) => [{ type: "Employee", id }],
    }),

    createEmployee: builder.mutation<any, Partial<any>>({
      query: (body) => ({
        url: `${EMPLOYEE_URL}`,
        method: "POST",
        body,
        credentials: "include",
      }),
      invalidatesTags: [{ type: "Employee", id: "LIST" }, { type: "Employee", id: "DELETED_LIST" }, "User"],
    }),

    updateEmployee: builder.mutation<any, { id: string; body: Partial<any> }>({
      query: ({ id, body }) => ({
        url: `${EMPLOYEE_URL}/${id}`,
        method: "PUT",
        body,
        credentials: "include",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Employee", id }, { type: "Employee", id: "LIST" }, "User"],
    }),

    deleteEmployee: builder.mutation<any, string>({
      query: (id) => ({
        url: `${EMPLOYEE_URL}/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: [{ type: "Employee", id: "LIST" }, { type: "Employee", id: "DELETED_LIST" }, "User"],
    }),

    restoreEmployee: builder.mutation<any, string>({
      query: (id) => ({
        url: `${EMPLOYEE_URL}/${id}/restore`,
        method: "POST",
        credentials: "include",
      }),
      invalidatesTags: [{ type: "Employee", id: "LIST" }, { type: "Employee", id: "DELETED_LIST" }, "User"],
    }),
  }),
});

export const { 
  useGetEmployeesQuery,
  useGetEmployeesForUserListsQuery,
  useGetDeletedEmployeesQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useRestoreEmployeeMutation,
} = employeeApiSlice;
