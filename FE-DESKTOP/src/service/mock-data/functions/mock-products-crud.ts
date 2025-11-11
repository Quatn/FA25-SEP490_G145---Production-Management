import mockProducts from "../mock-products.json";

export const mockProductQuery = async ({}) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    data: {
      products: mockProducts,
    },
  };
};
