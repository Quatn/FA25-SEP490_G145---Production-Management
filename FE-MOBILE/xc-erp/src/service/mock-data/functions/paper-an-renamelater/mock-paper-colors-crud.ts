import paperColors from "../../mock-paper-colors.json";

export const mockPaperColorsQuery = async ({ } : {}) => {
  await new Promise((resolve) => setTimeout(resolve, 120));
  return { data: { paperColors } };
};
