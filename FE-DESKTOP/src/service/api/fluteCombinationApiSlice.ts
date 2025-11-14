import { apiSlice } from "./apiSlice";
import { BaseResponse, PaginatedList } from "@/types/DTO/Response";
import { FluteCombination } from "@/types/FluteCombination";
import { FLUTE_COMBINATION_URL } from "../constants";

export const FluteCombinationApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getAllFluteCombination: builder.query<{ success: boolean; message: string; data: FluteCombination[] }, void>({
            query: () => ({
                url: `${FLUTE_COMBINATION_URL}/list-all`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["FluteCombination"],
        }),

        getFluteCombination: builder.query<BaseResponse<PaginatedList<FluteCombination>>, { page?: number; limit?: number, search?: string }>(
            {
                query: ({ page = 1, limit = 10, search = '' }) => ({
                    url: `${FLUTE_COMBINATION_URL}/list`,
                    method: "GET",
                    params: { page, limit, search },
                    credentials: "include",
                }),
                providesTags: ["FluteCombination"],
            }),

        addFluteCombination: builder.mutation<{ success: boolean; message: string }, FluteCombination>({
            query: (body) => ({
                url: `${FLUTE_COMBINATION_URL}/create`,
                method: "POST",
                body,
                credentials: "include",
            }),
            invalidatesTags: ["FluteCombination"],
        }),

        updateFluteCombination: builder.mutation<{ success: boolean; message: string }, FluteCombination>({
            query: (body) => {
                const id = body._id;
                return {
                    url: `${FLUTE_COMBINATION_URL}/update/${id}`,
                    method: "PATCH",
                    body,
                    credentials: "include",
                };
            },
            invalidatesTags: ["FluteCombination"],
        }),

        deleteFluteCombination: builder.mutation<{ success: boolean; message: string }, FluteCombination>({
            query: (body) => {
                const id = body._id;
                return {
                    url: `${FLUTE_COMBINATION_URL}/delete-soft/${id}`,
                    method: "DELETE",
                    credentials: "include",
                };
            },
            invalidatesTags: ["FluteCombination"],
        }),
    }),
});

export const {
    useGetAllFluteCombinationQuery,
    useAddFluteCombinationMutation,
    useGetFluteCombinationQuery,
    useUpdateFluteCombinationMutation,
    useDeleteFluteCombinationMutation,
} = FluteCombinationApiSlice;