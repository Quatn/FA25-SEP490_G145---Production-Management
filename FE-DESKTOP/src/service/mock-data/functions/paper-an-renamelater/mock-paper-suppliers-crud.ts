import paperSuppliers from "../../mock-paper-suppliers.json";

export const mockPaperSuppliersQuery = async ({ } : {}) => {
  await new Promise((resolve) => setTimeout(resolve, 120));
  return { data: { paperSuppliers } };
};
