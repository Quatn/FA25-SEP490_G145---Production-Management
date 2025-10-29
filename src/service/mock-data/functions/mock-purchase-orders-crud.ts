import { PaginatedList } from "@/types/DTO/Response";
import mockPurchaseOrders from "../mock-purchase-orders.json";
import { PurchaseOrder } from "@/types/PurchaseOrder";
import { paginatedListFromArray } from "@/utils/dtoUtils";

export const mockPurchaseOrdersQuery = async (
  { page, limit }: { page: number; limit: number },
): Promise<
  PaginatedList<
    PurchaseOrder
  >
> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const data: PurchaseOrder[] = mockPurchaseOrders.map((order) => ({
    ...order,
    orderDate: new Date(order.orderDate),
  }));

  return paginatedListFromArray(
    data,
    page,
    limit,
    data.length,
  );
};
