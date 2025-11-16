export type MockResponse<TData, TError = FetchBaseQueryError> =
  | { data: TData }
  | { error: TError };
