import { PaginatedList } from "@/types/DTO/Response";
import mockPurchaseOrders from "../mock-purchase-orders.json";
import { PurchaseOrder } from "@/types/PurchaseOrder";
import { paginatedListFromArray } from "@/utils/dtoUtils";

export const mockPurchaseOrdersQuery = async (
  { page, limit }: { page: number; limit: number },
): Promise<
  PaginatedList<
    Serialized<PurchaseOrder>
  >
> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const slicedData = mockPurchaseOrders.slice(startIndex, endIndex);

  return paginatedListFromArray(
    slicedData,
    page,
    limit,
    mockPurchaseOrders.length,
  );
};
