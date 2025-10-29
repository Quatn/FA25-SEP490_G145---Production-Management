import { PaperColor } from "@/types/PaperColor";
import { PAPER_COLOR_URL, USE_MOCK_DATA } from "../constants";
import { mockPaperColorQuery } from "../mock-data/functions/mock-paper-color-crud";
import { apiSlice } from "./apiSlice";

export const paperColorApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPaperColor: builder.query({
            ...(USE_MOCK_DATA
                ? {
                    queryFn: async () => {
                        try {
                            const data = await mockPaperColorQuery({});
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
                        url: PAPER_COLOR_URL,
                        method: "GET",
                        credentials: "include",
                    }),
                }),
        }),

        addPaperColor: builder.mutation<{ success: boolean; message: string }, PaperColor>({
            ...(USE_MOCK_DATA
                ? {
                    queryFn: async (body) => {
                        console.log("Mock add color", body);
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
                        url: `${PAPER_COLOR_URL}/messages`,
                        method: "POST",
                        body,
                        credentials: "include",
                    }),
                })
        }),

        updatePaperColor: builder.mutation<{ success: boolean; message: string }, PaperColor>({
            ...(USE_MOCK_DATA
                ? {
                    queryFn: async (body) => {
                        console.log("Mock update color", body);
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
                        url: `${PAPER_COLOR_URL}/messages/${body._id}`,
                        method: "PUT",
                        body,
                        credentials: "include",
                    }),
                }),
        }),

        deletePaperColor: builder.mutation<{ success: boolean; message: string }, string>({
            ...(USE_MOCK_DATA
                ? {
                    queryFn: async (code) => {
                        console.log("Mock delete color", code);
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
                        url: `${PAPER_COLOR_URL}/messages/${code}`,
                        method: "DELETE",
                        credentials: "include",
                    }),
                }),
        }),
    }),
});

export const {
    useAddPaperColorMutation,
    useGetPaperColorQuery,
    useUpdatePaperColorMutation,
    useDeletePaperColorMutation,
} = paperColorApiSlice;