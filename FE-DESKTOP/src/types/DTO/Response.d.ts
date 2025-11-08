export type QueryResponse<TData, TError = FetchBaseQueryError> =
  | { data: TData }
  | { error: TError };

export interface PaginatedList<T> {
  data: T[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
