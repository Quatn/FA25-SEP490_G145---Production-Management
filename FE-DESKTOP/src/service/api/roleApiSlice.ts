import { apiSlice } from "@/service/api/apiSlice";
import { ROLE_URL } from "@/service/constants";

export const roleApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllRoles: builder.query<any, void>({
            query: () => ({
                url: `${ROLE_URL || "/employee-role/role"}`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: [{ type: "Role", id: "LIST" }],
        }),
    }),
});

export const { useGetAllRolesQuery } = roleApiSlice;
