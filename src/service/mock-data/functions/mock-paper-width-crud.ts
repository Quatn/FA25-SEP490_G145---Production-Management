import mockPaperWidth from "../mock-paper-width.json";

export const mockPaperWidthQuery = async ({ }) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    data: mockPaperWidth,
  };
};