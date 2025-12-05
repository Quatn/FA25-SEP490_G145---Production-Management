import { UnpopulatedFieldError } from "@/lib/errors/UnpopulatedFieldError";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import check from "check-types";

const getPopulatedSubPo = (mo: Serialized<ManufacturingOrder>) => {
  if (check.string(mo.purchaseOrderItem) || check.string(mo.purchaseOrderItem.subPurchaseOrder)
  ) throw new UnpopulatedFieldError("mo.purchaseOrderItem must be populated: purchaseOrderItem -> subPurchaseOrder");
  return mo.purchaseOrderItem.subPurchaseOrder
}

const getPopulatedPo = (mo: Serialized<ManufacturingOrder>) => {
  if (check.string(mo.purchaseOrderItem)
    || check.string(mo.purchaseOrderItem.subPurchaseOrder)
    || check.string(mo.purchaseOrderItem.subPurchaseOrder?.purchaseOrder)
  ) throw new UnpopulatedFieldError("mo.purchaseOrderItem must be populated: purchaseOrderItem -> subPurchaseOrder -> purchaseOrder");
  return mo.purchaseOrderItem.subPurchaseOrder?.purchaseOrder
}

const getPopulatedCustomer = (mo: Serialized<ManufacturingOrder>) => {
  if (check.string(mo.purchaseOrderItem)
    || check.string(mo.purchaseOrderItem.subPurchaseOrder)
    || check.string(mo.purchaseOrderItem.subPurchaseOrder?.purchaseOrder)
    || check.string(mo.purchaseOrderItem.subPurchaseOrder?.purchaseOrder?.customer)
  ) throw new UnpopulatedFieldError("mo.purchaseOrderItem must be populated: purchaseOrderItem -> subPurchaseOrder -> purchaseOrder -> customer");
  return mo.purchaseOrderItem.subPurchaseOrder?.purchaseOrder?.customer
}

const getPopulatedWare = (mo: Serialized<ManufacturingOrder>) => {
  if (check.string(mo.purchaseOrderItem)
    || check.string(mo.purchaseOrderItem.ware)
  ) throw new UnpopulatedFieldError("mo.purchaseOrderItem must be populated: purchaseOrderItem -> ware");
  return mo.purchaseOrderItem.ware
}

export const manufacturingOrderComponentUtils = {
  getPopulatedPo,
  getPopulatedSubPo,
  getPopulatedCustomer,
  getPopulatedWare,
}
