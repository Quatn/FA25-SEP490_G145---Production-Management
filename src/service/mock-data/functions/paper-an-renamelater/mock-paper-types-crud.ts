import paperTypes from "../../mock-paper-types.json";

export const mockPaperTypesQuery = async ({ } : {}) => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return { data: { paperTypes } };
};