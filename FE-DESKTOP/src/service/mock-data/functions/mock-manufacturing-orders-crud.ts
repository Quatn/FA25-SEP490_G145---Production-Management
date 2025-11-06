import { FullDetailManufacturingOrderDTO } from "@/types/DTO/FullDetailManufactureOrder";
import mockManufacturingOrders from "../mock-manufacturing-orders.json";
import mockPurchaseOrderItems from "../mock-purchase-order-items.json";
import mockSubPurchaseOrder from "../mock-sub-purchase-orders.json";
import mockPurchaseOrder from "../mock-purchase-orders.json";
import mockWares from "../mock-ware-catalog.json";
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem";
import check from "check-types";
import { Ware } from "@/types/Ware";
import { SubPurchaseOrder } from "@/types/SubPurchaseOrder";
import { PurchaseOrder } from "@/types/PurchaseOrder";
import { PaginatedList } from "@/types/DTO/Response";
import { paginatedListFromArray } from "@/utils/dtoUtils";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";

export const mockManufacturingOrderQuery = async (
  { page, limit }: { page: number; limit: number },
): Promise<
  PaginatedList<
    Serialized<ManufacturingOrder>
  >
> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const slicedData = mockManufacturingOrders.slice(startIndex, endIndex);

  return paginatedListFromArray(
    slicedData,
    page,
    limit,
    mockManufacturingOrders.length,
  );
};

export const mockFullDetailManufacturingOrderQuery = async (
  { page, limit }: { page: number; limit: number },
): Promise<
  PaginatedList<
    Serialized<FullDetailManufacturingOrderDTO>
  >
> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  let data: Serialized<FullDetailManufacturingOrderDTO>[] = [];

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const slicedData = mockManufacturingOrders.slice(startIndex, endIndex);

  const poitems: PurchaseOrderItem[] = slicedData.map((mo) =>
    mockPurchaseOrderItems.find((poi) => poi.id === mo.purchaseOrderItemId)
  ).filter((poi) => !check.undefined(poi));

  if (poitems.length != slicedData.length) {
    throw ({
      message:
        "Some manufacturing orders did not have a corresponding purchase order item",
    });
  }

  const wares: Ware[] = poitems.map((poi) =>
    mockWares.find((ware) => ware.code === poi.wareCode)
  ).filter((ware) => !check.undefined(ware));

  if (wares.length != slicedData.length) {
    throw ({
      message: "Some manufacturing orders did not have a corresponding ware",
    });
  }

  const subpo: Serialized<SubPurchaseOrder>[] = poitems.map((poi) =>
    mockSubPurchaseOrder.find((spo) => spo.id === poi.subPurchaseOrderId)
  ).filter((spoi) => !check.undefined(spoi));

  if (subpo.length != slicedData.length) {
    throw ({
      message:
        "Some purchase order items did not have a corresponding sub purchase order item" +
        subpo.length + "/" + slicedData.length,
    });
  }

  const po: Serialized<PurchaseOrder>[] = subpo.map((subpoi) =>
    mockPurchaseOrder.find((spoi) => spoi.id === subpoi.purchaseOrderId)
  ).filter((poi) => !check.undefined(poi));

  if (po.length != slicedData.length) {
    throw ({
      message:
        "Some sub purchase orders did not have a corresponding purchase order",
    });
  }

  data = slicedData.map((
    mo,
    index,
  ) => ({
    ...wares[index],
    ...poitems[index],
    ...mo,
    purchaseOrderItemId: poitems[index].id,
    purchaseOrderItemNote: poitems[index].note,
    wareId: wares[index].id,
    wareCode: wares[index].code,
    wareNote: wares[index].note,
    manufacturingDate: mo.manufacturingDate,
    requestedDatetime: mo.requestedDatetime,
    customerCode: po[index].customerCode,
    orderDate: po[index].orderDate,
    deliveryDate: subpo[index].deliveryDate,
    purchaseOrderId: po[index].id,
  }));

  return paginatedListFromArray(
    data,
    page,
    limit,
    mockManufacturingOrders.length,
  );
};
