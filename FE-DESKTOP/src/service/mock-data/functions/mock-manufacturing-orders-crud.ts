import { FullDetailManufacturingOrderDTO } from "@/types/DTO/FullDetailManufactureOrder";
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem";
import check from "check-types";
import { Ware } from "@/types/Ware";
import { SubPurchaseOrder } from "@/types/SubPurchaseOrder";
import { PurchaseOrder } from "@/types/PurchaseOrder";
import { PaginatedList } from "@/types/DTO/Response";
import { paginatedListFromArray } from "@/utils/dtoUtils";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { getDb } from "../mockDb";
import { refreshPurchaseOrderItems } from "../recalculation";

export const mockManufacturingOrderQuery = async (
  { page, limit }: { page: number; limit: number },
): Promise<
  PaginatedList<
    Serialized<ManufacturingOrder>
  >
> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const { manufacturingOrders } = getDb();

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const slicedData = manufacturingOrders.slice(startIndex, endIndex);

  return paginatedListFromArray(
    slicedData,
    page,
    limit,
    manufacturingOrders.length,
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
  refreshPurchaseOrderItems();

  await new Promise((resolve) => setTimeout(resolve, 500));

  let data: Serialized<FullDetailManufacturingOrderDTO>[] = [];

  const {
    manufacturingOrders,
    purchaseOrder,
    subPurchaseOrder,
    purchaseOrderItems,
    wares,
  } = getDb();

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const slicedData = manufacturingOrders.slice(startIndex, endIndex);

  const poitems: PurchaseOrderItem[] = slicedData.map((mo) =>
    purchaseOrderItems.find((poi) => poi.id === mo.purchaseOrderItemId)
  ).filter((poi) => !check.undefined(poi));

  if (poitems.length != slicedData.length) {
    throw ({
      message:
        "Some manufacturing orders did not have a corresponding purchase order item",
    });
  }

  const mappedWares: Ware[] = poitems.map((poi) =>
    wares.find((ware) => ware.code === poi.wareCode)
  ).filter((ware) => !check.undefined(ware));

  if (mappedWares.length != slicedData.length) {
    throw ({
      message: "Some manufacturing orders did not have a corresponding ware",
    });
  }

  const subpo: Serialized<SubPurchaseOrder>[] = poitems.map((poi) =>
    subPurchaseOrder.find((spo) => spo.id === poi.subPurchaseOrderId)
  ).filter((spoi) => !check.undefined(spoi));

  if (subpo.length != slicedData.length) {
    throw ({
      message:
        "Some purchase order items did not have a corresponding sub purchase order item" +
        subpo.length + "/" + slicedData.length,
    });
  }

  const po: Serialized<PurchaseOrder>[] = subpo.map((subpoi) =>
    purchaseOrder.find((spoi) => spoi.id === subpoi.purchaseOrderId)
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
  ) => {
    return {
      ...mappedWares[index],
      ...poitems[index],
      ...mo,
      purchaseOrderItemId: poitems[index].id,
      purchaseOrderItemNote: poitems[index].note,
      wareId: mappedWares[index].id,
      wareCode: mappedWares[index].code,
      wareNote: mappedWares[index].note,
      manufacturingDate: mo.manufacturingDate,
      requestedDatetime: mo.requestedDatetime,
      customerCode: po[index].customerCode,
      orderDate: po[index].orderDate,
      deliveryDate: subpo[index].deliveryDate,
      purchaseOrderId: po[index].id,
    };
  });

  return paginatedListFromArray(
    data,
    page,
    limit,
    manufacturingOrders.length,
  );
};
