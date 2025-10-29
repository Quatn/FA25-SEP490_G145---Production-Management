import paperGrammages from "../../mock-paper-grammages.json";

export const mockPaperGrammagesQuery = async ({ } : {}) => {
  await new Promise((resolve) => setTimeout(resolve, 120));
  return { data: { paperGrammages } };
};
