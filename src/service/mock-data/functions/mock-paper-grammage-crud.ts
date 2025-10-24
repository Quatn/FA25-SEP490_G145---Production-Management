import mockPaperGrammage from "../FA25-SEP490_G145---StorageManagement.papergrammage.json"

export const mockPaperGrammageQuery = async ({}) => {

  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    data: {
      paperGrammages: mockPaperGrammage,
    },
  };
};
