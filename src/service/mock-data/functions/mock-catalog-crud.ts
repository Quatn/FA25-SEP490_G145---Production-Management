import check from "check-types";
import mockProductCatalog from "../mock-product-catalog.json";
import mockWareCatalog from "../mock-ware-catalog.json";

export const mockProductsQuery = async ({ }) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    data: mockProductCatalog,
  };
};

export const mockWaresQuery = async ({ }) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    data: mockWareCatalog,
  };
};

export const mockWaresQueryByCodes = async (
  { codes }: { codes: string[]; page: number; limit: number },
) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const queryResult = mockWareCatalog.filter((ware) =>
    check.contains(codes, ware.code)
  );

  return {
    data: queryResult,
  };
};
