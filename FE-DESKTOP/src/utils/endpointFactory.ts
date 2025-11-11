// createApiEndpoint.ts
import type {
  FetchArgs,
  FetchBaseQueryError,
  QueryDefinition,
} from "@reduxjs/toolkit/query";
import { USE_MOCK_DATA } from "@/service/constants";
import { ApiBaseQuery, ApiBuilder } from "@/service/api/apiSlice";
import { BaseResponse } from "@/types/DTO/BaseResponse";
import { MockResponse } from "@/types/DTO/MockResponse";
import { SerializableRecord } from "@/types/SerializableRecord";

/**
 * Creates a strongly-typed RTK Query endpoint definition that supports
 * both mock and live modes with BaseResponse auto-unwrapping.
 */
export function createApiEndpoint<TData, TArgs extends SerializableRecord>(
  builder: ApiBuilder,
  config: {
    query: (args: TArgs) => FetchArgs;
    mockFn?: (args: TArgs) => Promise<TData>;
    transform?: (response: BaseResponse<TData>) => TData;
  },
): QueryDefinition<TArgs, ApiBaseQuery, string, TData, string> {
  const { query, mockFn, transform } = config;

  if (USE_MOCK_DATA && mockFn) {
    return builder.query<TData, TArgs>({
      queryFn: async (args): Promise<MockResponse<TData>> => {
        try {
          const data = await mockFn(args);
          return { data };
        } catch (err) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: (err as Error).message,
            } as unknown as FetchBaseQueryError,
          };
        }
      },
    });
  }

  return builder.query<TData, TArgs>({
    query,
    transformResponse: (response: BaseResponse<TData>) => {
      if (!response.success) {
        throw new Error(response.message || "Request failed");
      }
      return transform ? transform(response) : (response.data as TData);
    },
  });
}
