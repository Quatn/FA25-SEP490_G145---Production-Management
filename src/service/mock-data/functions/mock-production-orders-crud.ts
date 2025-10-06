import mockProductionOrders from "../mock-production-orders.json";

export const mockProductionOrderQuery = async ({}) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    data: {
      productionOrders: mockProductionOrders,
    },
  };
};
