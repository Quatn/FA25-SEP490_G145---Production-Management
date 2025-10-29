import { PaperWidth } from "@/types/PaperWidth";
import { PAPER_WIDTH_URL, USE_MOCK_DATA } from "../constants";
import { mockPaperWidthQuery } from "../mock-data/functions/mock-paper-width-crud";
import { apiSlice } from "./apiSlice";

export const paperWidthApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPaperWidth: builder.query({
            ...(USE_MOCK_DATA
                ? {
                    queryFn: async () => {
                        try {
                            const data = await mockPaperWidthQuery({});
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
                        url: PAPER_WIDTH_URL,
                        method: "GET",
                        credentials: "include",
                    }),
                }),
        }),

        addPaperWidth: builder.mutation<{ success: boolean; message: string }, PaperWidth>({
            ...(USE_MOCK_DATA
                ? {
                    queryFn: async (body) => {
                        console.log("Mock add width", body);
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
                        url: `${PAPER_WIDTH_URL}/messages`,
                        method: "POST",
                        body,
                        credentials: "include",
                    }),
                })
        }),

        updatePaperWidth: builder.mutation<{ success: boolean; message: string }, PaperWidth>({
            ...(USE_MOCK_DATA
                ? {
                    queryFn: async (body) => {
                        console.log("Mock update width", body);
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
                        url: `${PAPER_WIDTH_URL}/messages/${body._id}`,
                        method: "PUT",
                        body,
                        credentials: "include",
                    }),
                }),
        }),

        deletePaperWidth: builder.mutation<{ success: boolean; message: string }, string>({
            ...(USE_MOCK_DATA
                ? {
                    queryFn: async (code) => {
                        console.log("Mock delete width", code);
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
                        url: `${PAPER_WIDTH_URL}/messages/${code}`,
                        method: "DELETE",
                        credentials: "include",
                    }),
                }),
        }),

    }),
});

export const {
    useAddPaperWidthMutation,
    useGetPaperWidthQuery,
    useUpdatePaperWidthMutation,
    useDeletePaperWidthMutation,
} = paperWidthApiSlice;