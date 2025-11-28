import { apiSlice } from './apiSlice';
import { USER_URL } from '../constants';
import { CreateUserResponseDto } from '@/types/DTO/user/CreateUserReponseDto';
import { CreateUserRequestDto } from '@/types/DTO/user/CreateUserRequestDto';
import { UpdateManyUsersResponseDto } from '@/types/DTO/user/UpdateManyUserReponseDto';
import { UpdateManyUsersRequestDto } from '@/types/DTO/user/UpdateManyUserRequestDto';
import { ChangePasswordResponseDto } from '@/types/DTO/user/ChangePasswordResponseDto';
import { ChangePasswordRequestDto } from '@/types/DTO/user/ChangePasswordRequestDto';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /*
    getUsers: createApiEndpoint<
      PageResponse<Serialized<User>>,
      { page: number; limit: number, query?: string }
    >(builder, {
      query: ({ page, limit, query }) => ({
        url: `${USER_URL}/query/full-details`,
        method: "GET",
        params: { page, limit, query },
        credentials: "include",
      }),
      providesTags: ["User"],
    }),
    */

    createUsers: builder.mutation<
      CreateUserResponseDto,
      CreateUserRequestDto
    >({
      query: (body) => ({
        url: `${USER_URL}/create`,
        method: "POST",
        body,
        credentials: "include",
      }),
      invalidatesTags: ["User"],
    }),

    updateManyUsers: builder.mutation<
      UpdateManyUsersResponseDto,
      UpdateManyUsersRequestDto
    >({
      query: (body) => ({
        url: `${USER_URL}/update-many`,
        method: "PATCH",
        body,
        credentials: "include",
      }),
      invalidatesTags: ["User"],
    }),

    changePassword: builder.mutation<
      ChangePasswordResponseDto,
      ChangePasswordRequestDto
    >({
      query: (body) => ({
        url: `${USER_URL}/change-password`,
        method: "PATCH",
        body,
        credentials: "include",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useCreateUsersMutation, useUpdateManyUsersMutation, useChangePasswordMutation } = userApiSlice;
