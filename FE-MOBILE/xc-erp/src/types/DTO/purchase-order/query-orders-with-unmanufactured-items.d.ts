import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { PurchaseOrder } from "@/types/PurchaseOrder";
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem";
import { SubPurchaseOrder } from "@/types/SubPurchaseOrder";

class Base {
  manufacturedItemCount: number;
  unmanufacturedItemCount: number;
}

export interface QueryOrdersWithUnmanufacturedItemsDto_PurchaseOrderItem
  extends PurchaseOrderItem {
  manufacturingOrder: ManufacturingOrder;
  isManufactured: boolean;
}

export interface QueryOrdersWithUnmanufacturedItemsDto_SubPurchaseOrder
  extends Base {
  subPurchaseOrder: SubPurchaseOrder;
  purchaseOrderItems: QueryOrdersWithUnmanufacturedItemsDto_PurchaseOrderItem[];
}

export interface QueryOrdersWithUnmanufacturedItemsDto extends Base {
  subPurchaseOrders: QueryOrdersWithUnmanufacturedItemsDto_SubPurchaseOrder[];
  purchaseOrder: PurchaseOrder;
}
