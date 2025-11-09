import { apiSlice } from "./apiSlice";
import { AUTH_URL, USE_MOCK_DATA } from "../constants";
import { mockLogin, mockLogout } from "../mock-data/functions/mock-auths";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    logIn: builder.mutation({
      ...(USE_MOCK_DATA
        ? {
          queryFn: (
            { username, password }: { username: string; password: string },
          ) => mockLogin({ username, password }),
        }
        : {
          query: (
            { username, password }: { username: string; password: string },
          ) => ({
            url: `${AUTH_URL}/log-in`,
            method: "POST",
            body: { username, password },
            credentials: "include",
          }),
        }),
    }),

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

    logOut: builder.mutation<unknown, void>({
      ...(USE_MOCK_DATA
        ? {
          queryFn: () => mockLogout(),
        }
        : {
          query: () => ({
            url: `${AUTH_URL}/log-out`,
            method: "POST",
            credentials: "include",
          }),
        }),
    }),
  }),
});

export const {
  useLogInMutation,
  useSignUpMutation,
  useVerifyEmailMutation,
  useLogOutMutation,
  useAdminLogInMutation,
} = authApiSlice;
