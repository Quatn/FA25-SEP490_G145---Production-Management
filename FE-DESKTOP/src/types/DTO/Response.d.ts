// Old file, do not use, migrate if possible
export type QueryResponse<TData, TError = FetchBaseQueryError> =
  | { data: TData }
  | { error: TError };

export interface BaseResponse<T> {
  success: boolean; 
  message: string;  
  data: T;         
}

export interface PaginatedList<T> {
  data: T[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
