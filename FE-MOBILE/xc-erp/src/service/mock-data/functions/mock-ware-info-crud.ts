import mockWareInfo from "../mock-ware-info.json";

export const mockWareInfoQuery = async ({}) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    data: {
      wareInfo: mockWareInfo,
    },
  };
};
