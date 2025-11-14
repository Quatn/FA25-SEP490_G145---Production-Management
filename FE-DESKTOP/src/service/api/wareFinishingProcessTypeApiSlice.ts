import { apiSlice } from './apiSlice';
import { WARE_FINISHING_PROCESS_TYPE_URL } from '../constants';
import { BaseResponse, PaginatedList } from "@/types/DTO/Response";
import { WareFinishingProcessType } from '../../types/WareFinishingProcessType';

export const wareFinishingProcessTypeApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getAllWareFinishingProcessType: builder.query<{ success: boolean; message: string; data: WareFinishingProcessType[] }, void>({
            query: () => ({
                url: `${WARE_FINISHING_PROCESS_TYPE_URL}/list-all`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["WareFinishingProcessType"],
        }),

        getWareFinishingProcessType: builder.query<BaseResponse<PaginatedList<WareFinishingProcessType>>, { page?: number; limit?: number, search?: string }>({
            query: ({ page = 1, limit = 10, search = '' }) => ({
                url: `${WARE_FINISHING_PROCESS_TYPE_URL}/list`,
                method: "GET",
                params: { page, limit, search },
                credentials: "include",
            }),
            providesTags: ["WareFinishingProcessType"],
        }),

        addWareFinishingProcessType: builder.mutation<{ success: boolean; message: string }, WareFinishingProcessType>({
            query: (body) => ({
                url: `${WARE_FINISHING_PROCESS_TYPE_URL}/create`,
                method: "POST",
                body,
                credentials: "include",
            }),
            invalidatesTags: ["WareFinishingProcessType"],
        }),

        updateWareFinishingProcessType: builder.mutation<{ success: boolean; message: string }, WareFinishingProcessType>({
            query: (body) => {
                const id = body._id;
                return {
                    url: `${WARE_FINISHING_PROCESS_TYPE_URL}/update/${id}`,
                    method: "PATCH",
                    body,
                    credentials: "include",
                };
            },
            invalidatesTags: ["WareFinishingProcessType"],
        }),

        deleteWareFinishingProcessType: builder.mutation<{ success: boolean; message: string }, WareFinishingProcessType>({
            query: (body) => {
                const id = body._id;
                return {
                    url: `${WARE_FINISHING_PROCESS_TYPE_URL}/delete-soft/${id}`,
                    method: "DELETE",
                    credentials: "include",
                };
            },
            invalidatesTags: ["WareFinishingProcessType"],
        }),
    }),
});

export const {
    useGetWareFinishingProcessTypeQuery,
    useGetAllWareFinishingProcessTypeQuery,
    useAddWareFinishingProcessTypeMutation,
    useUpdateWareFinishingProcessTypeMutation,
    useDeleteWareFinishingProcessTypeMutation,
} = wareFinishingProcessTypeApiSlice;
