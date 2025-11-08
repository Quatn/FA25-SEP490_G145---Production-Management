import { PaginatedList } from "@/types/DTO/Response";

export function paginatedListFromArray<T>(
  list: T[],
  page: number,
  limit: number,
  totalItems: number,
): PaginatedList<T> {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    data: list,
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
