import mockPaperSuppliers from "../FA25-SEP490_G145---StorageManagement.papersupplier.json"

import { PaperSuppliersResponse } from "@/types/paperSupplier.types";

export const mockPaperSupplierQuery = async ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}): Promise<{ data: PaperSuppliersResponse }> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const start = (page - 1) * limit;
  const end = page * limit;

  return {
    data: {
      paperSuppliers: mockPaperSuppliers.slice(start, end),
      total: mockPaperSuppliers.length,
      page,
      limit,
    },
  };
};
