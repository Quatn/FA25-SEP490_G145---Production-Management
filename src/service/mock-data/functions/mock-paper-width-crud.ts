import mockPaperWidth from "../FA25-SEP490_G145---StorageManagement.paperwidth.json"

export const mockPaperWidthQuery = async ({}) => {

  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    data: {
      paperWidths: mockPaperWidth,
    },
  };
};
