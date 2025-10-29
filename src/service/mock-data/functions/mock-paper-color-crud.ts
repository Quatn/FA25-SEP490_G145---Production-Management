import mockPaperColor from "../mock-paper-color.json";

export const mockPaperColorQuery = async ({ }) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    data: mockPaperColor,
  };
};