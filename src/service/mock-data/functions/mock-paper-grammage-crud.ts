import mockPaperGrammage from "../mock-paper-grammage.json";

export const mockPaperGrammageQuery = async ({ }) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    data: mockPaperGrammage,
  };
};