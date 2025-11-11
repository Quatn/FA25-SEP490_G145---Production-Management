import { ApiProperty } from "@nestjs/swagger";
import { SubPurchaseOrder } from "../../schemas/sub-purchase-order.schema";
import { ManufacturingOrder } from "../../schemas/manufacturing-order.schema";
import { PurchaseOrder } from "../../schemas/purchase-order.schema";
import { PurchaseOrderItem } from "../../schemas/purchase-order-item.schema";
import { Pagination } from "@/common/dto/pagination.dto";

class Base {
  @ApiProperty()
  manufacturedItemCount: number;

  @ApiProperty()
  unmanufacturedItemCount: number;
}

class PurchaseOrderItemRes extends PurchaseOrderItem {
  manufacturingOrder: ManufacturingOrder;
  isManufactured: boolean;
}

class SubPurchaseOrderRes extends Base {
  subPurchaseOrder: SubPurchaseOrder;
  purchaseOrderItems: PurchaseOrderItemRes[];
}

export class QueryOrdersWithUnmanufacturedItemsDto extends Base {
  subPurchaseOrders: SubPurchaseOrderRes[];
  purchaseOrder: PurchaseOrder;
}
