import { apiSlice } from "./apiSlice";
import { AUTH_URL, USE_MOCK_DATA } from "../constants";
import { mockLogin, mockLogout } from "../mock-data/functions/mock-auths";
import { LoginResponseDto } from "@/types/DTO/auth/LoginResponseDto";
import { LoginRequestDto } from "@/types/DTO/auth/LoginRequestDto";
import { LogoutResponseDto } from "@/types/DTO/auth/LogoutResponseDto";
import { LogoutRequestDto } from "@/types/DTO/auth/LogoutRequestDto";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      LoginResponseDto,
      LoginRequestDto
    >({
      query: (body) => ({
        url: `${AUTH_URL}/login`,
        method: "POST",
        body,
        credentials: "include",
      }),
      invalidatesTags: ["User", "Auth"],
    }),

    logout: builder.mutation<
      LogoutResponseDto,
      LogoutRequestDto
    >({
      query: (body) => ({
        url: `${AUTH_URL}/logout`,
        method: "POST",
        body,
        credentials: "include",
      }),
      invalidatesTags: ["User", "Auth"],
    }),

    /*
    adminLogIn: builder.mutation({
      query: (data) => ({
        url: `${AUTH_URL}/admin/log-in`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    // Might be unnecessary
    signUp: builder.mutation({
      query: (data) => ({
        url: `${AUTH_URL}/sign-up`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    // Might be unnecessary
    verifyEmail: builder.mutation({
      query: (data) => ({
        url: `${AUTH_URL}/verify-email`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
    */
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
} = authApiSlice;
