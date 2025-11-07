import { ManufacturingOrder } from "../ManufacturingOrder";
import { PurchaseOrderItem } from "../PurchaseOrderItem";
import { Ware } from "../Ware";

export interface FullDetailManufacturingOrderDTO
  extends
  ManufacturingOrder,
  Omit<PurchaseOrderItem, "id" | "note" | "status">,
  Omit<Ware, "id" | "code" | "note"> {
  purchaseOrderItemId: string;
  purchaseOrderItemNote: string;
  wareId: string;
  wareCode: string;
  wareNote: string;
  customerCode: string;
  orderDate: Date;
  deliveryDate: Date;
  purchaseOrderId: string;
}
