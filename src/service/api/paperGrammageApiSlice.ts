import { PaperGrammage } from "@/types/PaperGrammage";
import { PAPER_GRAMMAGE_URL, USE_MOCK_DATA } from "../constants";
import { mockPaperGrammageQuery } from "../mock-data/functions/mock-paper-grammage-crud";
import { apiSlice } from "./apiSlice";

export const paperGrammageApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPaperGrammage: builder.query({
            ...(USE_MOCK_DATA
                ? {
                    queryFn: async () => {
                        try {
                            const data = await mockPaperGrammageQuery({});
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
                        url: PAPER_GRAMMAGE_URL,
                        method: "GET",
                        credentials: "include",
                    }),
                }),
        }),

        addPaperGrammage: builder.mutation<{ success: boolean; message: string }, PaperGrammage>({
            ...(USE_MOCK_DATA
                ? {
                    queryFn: async (body) => {
                        console.log("Mock add grammage", body);
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
                        url: `${PAPER_GRAMMAGE_URL}/messages`,
                        method: "POST",
                        body,
                        credentials: "include",
                    }),
                })
        }),

        updatePaperGrammage: builder.mutation<{ success: boolean; message: string }, PaperGrammage>({
            ...(USE_MOCK_DATA
                ? {
                    queryFn: async (body) => {
                        console.log("Mock update grammage", body);
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
                        url: `${PAPER_GRAMMAGE_URL}/messages/${body._id}`,
                        method: "PUT",
                        body,
                        credentials: "include",
                    }),
                }),
        }),

        deletePaperGrammage: builder.mutation<{ success: boolean; message: string }, string>({
            ...(USE_MOCK_DATA
                ? {
                    queryFn: async (code) => {
                        console.log("Mock delete grammage", code);
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
                        url: `${PAPER_GRAMMAGE_URL}/messages/${code}`,
                        method: "DELETE",
                        credentials: "include",
                    }),
                }),
        }),
    }),
});

export const {
    useAddPaperGrammageMutation,
    useGetPaperGrammageQuery,
    useUpdatePaperGrammageMutation,
    useDeletePaperGrammageMutation,
} = paperGrammageApiSlice;