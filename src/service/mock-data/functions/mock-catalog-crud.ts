import check from "check-types";
import mockProductCatalog from "../mock-product-catalog.json";
import mockWareCatalog from "../mock-ware-catalog.json";
import { Product } from "@/types/Product";
import { PaginatedList } from "@/types/DTO/Response";
import { Ware } from "@/types/Ware";
import { paginatedListFromArray } from "@/utils/dtoUtils";

export const mockProductsQuery = async (
  { page, limit }: { page: number; limit: number },
): Promise<PaginatedList<Serialized<Product>>> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const slicedData = mockProductCatalog.slice(startIndex, endIndex);

  const data: Product[] = slicedData.map((product) => ({
    ...product,
    // data mapping steps here if needed
  }));

  return paginatedListFromArray(data, page, limit, mockProductCatalog.length);
};

export const mockWaresQuery = async (
  { page, limit }: { page: number; limit: number },
): Promise<PaginatedList<Serialized<Ware>>> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const slicedData = mockWareCatalog.slice(startIndex, endIndex);

  const data: Ware[] = slicedData.map((ware) => ({
    ...ware,
    // data mapping steps here if needed
  }));

  return paginatedListFromArray(data, page, limit, mockWareCatalog.length);
};

export const mockWaresQueryByCodes = async (
  { codes, page, limit }: { codes: string[]; page: number; limit: number },
): Promise<PaginatedList<Serialized<Ware>>> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const filteredCatalog = mockWareCatalog.filter((ware) =>
    check.contains(codes, ware.code)
  );

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const slicedQueryResult = filteredCatalog.slice(startIndex, endIndex);

  return paginatedListFromArray(
    slicedQueryResult,
    page,
    limit,
    filteredCatalog.length,
  );
};
