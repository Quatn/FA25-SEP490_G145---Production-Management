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
    ManufacturingOrder
  >
> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const data: ManufacturingOrder[] = mockManufacturingOrders.map((order) => ({
    ...order,
    manufacturingDate: new Date(order.manufacturingDate),
    requestedDatetime: new Date(order.requestedDatetime),
  }));

  return paginatedListFromArray(
    data,
    page,
    limit,
    mockManufacturingOrders.length,
  );
};

export const mockFullDetailManufacturingOrderQuery = async (
  { page, limit }: { page: number; limit: number },
): Promise<
  PaginatedList<
    FullDetailManufacturingOrderDTO
  >
> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  let data: FullDetailManufacturingOrderDTO[] = [];

  const poitems: PurchaseOrderItem[] = mockManufacturingOrders.map((mo) =>
    mockPurchaseOrderItems.find((poi) => poi.id === mo.purchaseOrderItemId)
  ).filter((poi) => !check.undefined(poi));

  if (poitems.length != mockManufacturingOrders.length) {
    throw ({
      message:
        "Some manufacturing orders did not have a corresponding purchase order item",
    });
  }

  const wares: Ware[] = poitems.map((poi) =>
    mockWares.find((ware) => ware.code === poi.wareCode)
  ).filter((ware) => !check.undefined(ware));

  if (wares.length != mockManufacturingOrders.length) {
    throw ({
      message: "Some manufacturing orders did not have a corresponding ware",
    });
  }

  const subpo: SubPurchaseOrder[] = poitems.map((poi) => {
    const spo = mockSubPurchaseOrder.find((spo) =>
      spo.id === poi.subPurchaseOrderId
    );
    if (spo) {
      return {
        ...spo,
        deliveryDate: new Date(spo?.deliveryDate),
      };
    }
    return undefined;
  }).filter((spoi) => !check.undefined(spoi));

  if (subpo.length != mockManufacturingOrders.length) {
    throw ({
      message:
        "Some purchase order items did not have a corresponding sub purchase order item" +
        subpo.length + "/" + mockManufacturingOrders.length,
    });
  }

  const po: PurchaseOrder[] = subpo.map((subpoi) => {
    const po = mockPurchaseOrder.find((spoi) =>
      spoi.id === subpoi.purchaseOrderId
    );
    if (po) {
      return {
        ...po,
        orderDate: new Date(po?.orderDate),
      };
    }
    return undefined;
  }).filter((poi) => !check.undefined(poi));

  if (po.length != mockManufacturingOrders.length) {
    throw ({
      message:
        "Some sub purchase orders did not have a corresponding purchase order",
    });
  }

  data = mockManufacturingOrders.map((
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
    manufacturingDate: new Date(mo.manufacturingDate),
    requestedDatetime: new Date(mo.requestedDatetime),
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
