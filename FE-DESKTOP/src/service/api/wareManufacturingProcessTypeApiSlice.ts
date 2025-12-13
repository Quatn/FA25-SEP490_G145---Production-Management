import { apiSlice } from "./apiSlice";
import { BaseResponse, PaginatedList } from "@/types/DTO/Response";
import { WareManufacturingProcessType } from "@/types/WareManufacturingProcessType";
import { WARE_MANUFACTURING_PROCESS_TYPE_URL } from "../constants";

export const wareManufacturingProcessTypeApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getAllWareManufacturingTypes: builder.query<{ success: boolean; message: string; data: WareManufacturingProcessType[] }, void>({
            query: () => ({
                url: `${WARE_MANUFACTURING_PROCESS_TYPE_URL}/list-all`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["WareManufacturingProcessType"],
        }),

        getWareManufacturingProcessType: builder.query<BaseResponse<PaginatedList<WareManufacturingProcessType>>, { page?: number; limit?: number, search?: string }>(
            {
                query: ({ page = 1, limit = 10, search = '' }) => ({
                    url: `${WARE_MANUFACTURING_PROCESS_TYPE_URL}/list`,
                    method: "GET",
                    params: { page, limit, search },
                    credentials: "include",
                }),
                providesTags: ["WareManufacturingProcessType"],
            }),

        getDeletedWareManufacturingProcessType: builder.query<BaseResponse<PaginatedList<WareManufacturingProcessType>>, { page?: number; limit?: number }>(
            {
                query: ({ page = 1, limit = 10 }) => ({
                    url: `${WARE_MANUFACTURING_PROCESS_TYPE_URL}/list-deleted`,
                    method: "GET",
                    params: { page, limit },
                    credentials: "include",
                }),
                providesTags: ["WareManufacturingProcessType"],
            }),

        addWareManufacturingProcessType: builder.mutation<{ success: boolean; message: string }, WareManufacturingProcessType>({
            query: (body) => ({
                url: `${WARE_MANUFACTURING_PROCESS_TYPE_URL}/create`,
                method: "POST",
                body,
                credentials: "include",
            }),
            invalidatesTags: ["WareManufacturingProcessType"],
        }),

        updateWareManufacturingProcessType: builder.mutation<{ success: boolean; message: string }, WareManufacturingProcessType>({
            query: (body) => {
                const id = body._id;
                return {
                    url: `${WARE_MANUFACTURING_PROCESS_TYPE_URL}/update/${id}`,
                    method: "PATCH",
                    body,
                    credentials: "include",
                };
            },
            invalidatesTags: ["WareManufacturingProcessType"],
        }),

        deleteWareManufacturingProcessType: builder.mutation<{ success: boolean; message: string }, WareManufacturingProcessType>({
            query: (body) => {
                const id = body._id;
                return {
                    url: `${WARE_MANUFACTURING_PROCESS_TYPE_URL}/delete-soft/${id}`,
                    method: "DELETE",
                    credentials: "include",
                };
            },
            invalidatesTags: ["WareManufacturingProcessType"],
        }),

        deleteHardWareManufacturingProcessType: builder.mutation<{ success: boolean; message: string }, WareManufacturingProcessType>({
            query: (body) => {
                const id = body._id;
                return {
                    url: `${WARE_MANUFACTURING_PROCESS_TYPE_URL}/delete-hard/${id}`,
                    method: "DELETE",
                    credentials: "include",
                };
            },
            invalidatesTags: ["WareManufacturingProcessType"],
        }),

        restoreWareManufacturingProcessType: builder.mutation<{ success: boolean; message: string }, WareManufacturingProcessType>({
            query: (body) => {
                const id = body._id;
                return {
                    url: `${WARE_MANUFACTURING_PROCESS_TYPE_URL}/restore/${id}`,
                    method: "PATCH",
                    credentials: "include",
                };
            },
            invalidatesTags: ["WareManufacturingProcessType"],
        }),

    }),
});

export const {
    useGetAllWareManufacturingTypesQuery,
    useAddWareManufacturingProcessTypeMutation,
    useGetWareManufacturingProcessTypeQuery,
    useUpdateWareManufacturingProcessTypeMutation,
    useDeleteWareManufacturingProcessTypeMutation,
    useDeleteHardWareManufacturingProcessTypeMutation,
    useGetDeletedWareManufacturingProcessTypeQuery,
    useRestoreWareManufacturingProcessTypeMutation,
} = wareManufacturingProcessTypeApiSlice;