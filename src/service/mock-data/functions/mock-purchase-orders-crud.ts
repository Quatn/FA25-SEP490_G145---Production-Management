import mockPurchaseOrders from "../mock-purchase-orders.json";

export const mockPurchaseOrdersQuery = async ({}) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    data: mockPurchaseOrders,
  };
};
