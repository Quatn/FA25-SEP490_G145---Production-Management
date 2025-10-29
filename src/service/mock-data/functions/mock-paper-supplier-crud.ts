import mockPaperSupplier from "../mock-paper-supplier.json";

export const mockPaperSupplierQuery = async ({ }) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    data: mockPaperSupplier,
  };
};