import mockPaperColor from "../FA25-SEP490_G145---StorageManagement.papercolor.json"

export const mockPaperColorQuery = async ({}) => {

  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    data: {
      paperColors: mockPaperColor,
    },
  };
};
