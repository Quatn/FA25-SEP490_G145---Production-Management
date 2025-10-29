import { PAPER_SUPPLIER_URL, USE_MOCK_DATA } from "../constants";
import { mockPaperSupplierQuery } from "../mock-data/functions/mock-paper-supplier-crud";
import { apiSlice } from "./apiSlice";
import { PaginatedList, QueryResponse } from "@/types/DTO/Response";
import { PaperSupplier } from "@/types/PaperSupplier";

export const paperSupplierApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPaperSupplier: builder.query({
            ...(USE_MOCK_DATA
                ? {
                    queryFn: async () => {
                        try {
                            const data = await mockPaperSupplierQuery({});
                            return {
                                data,
                            };
                        } catch (err) {
                            return {
                                error: {
                                    status: "CUSTOM_ERROR",
                                    error: (err as Error).message,
                                },
                            };
                        }
                    },
                }
                : {
                    query: () => ({
                        url: PAPER_SUPPLIER_URL,
                        method: "GET",
                        credentials: "include",
                    }),
                }),
        }),

        addPaperSupplier: builder.mutation<{ success: boolean; message: string }, PaperSupplier>({
            ...(USE_MOCK_DATA
                ? {
                    queryFn: async (body) => {
                        console.log("Mock add supplier", body);
                        try {
                            await new Promise((resolve) => setTimeout(resolve, 1000));
                            return { data: { success: true, message: "Mock added successully" } };
                        } catch (err) {
                            return {
                                error: {
                                    status: "CUSTOM_ERROR",
                                    error: (err as Error).message,
                                },
                            };
                        }
                    },
                } : {
                    query: (body) => ({
                        url: `${PAPER_SUPPLIER_URL}/messages`,
                        method: "POST",
                        body,
                        credentials: "include",
                    }),
                })
        }),

        updatePaperSupplier: builder.mutation<{ success: boolean; message: string }, PaperSupplier>({
            ...(USE_MOCK_DATA
                ? {
                    queryFn: async (body) => {
                        console.log("Mock update supplier", body);
                        try {
                            await new Promise((resolve) => setTimeout(resolve, 1000));
                            return { data: { success: true, message: "Mock updated successully" } };
                        } catch (err) {
                            return {
                                error: {
                                    status: "CUSTOM_ERROR",
                                    error: (err as Error).message,
                                },
                            };
                        }
                    },
                }
                : {
                    query: (body) => ({
                        url: `${PAPER_SUPPLIER_URL}/messages/${body._id}`,
                        method: "PUT",
                        body,
                        credentials: "include",
                    }),
                }),
        }),

        deletePaperSupplier: builder.mutation<{ success: boolean; message: string }, string>({
            ...(USE_MOCK_DATA
                ? {
                    queryFn: async (code) => {
                        console.log("Mock delete supplier", code);
                        try {
                            await new Promise((resolve) => setTimeout(resolve, 1000));
                            return { data: { success: true, message: "Mock deleted successully" } };
                        } catch (err) {
                            return {
                                error: {
                                    status: "CUSTOM_ERROR",
                                    error: (err as Error).message,
                                },
                            };
                        }
                    },
                }
                : {
                    query: (code) => ({
                        url: `${PAPER_SUPPLIER_URL}/messages/${code}`,
                        method: "DELETE",
                        credentials: "include",
                    }),
                }),
        }),
    }),
});

export const {
    useAddPaperSupplierMutation,
    useGetPaperSupplierQuery,
    useUpdatePaperSupplierMutation,
    useDeletePaperSupplierMutation,
} = paperSupplierApiSlice;