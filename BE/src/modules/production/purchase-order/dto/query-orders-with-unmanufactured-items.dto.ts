import { ApiProperty } from "@nestjs/swagger";
import { SubPurchaseOrder } from "../../schemas/sub-purchase-order.schema";
import { ManufacturingOrder } from "../../schemas/manufacturing-order.schema";
import { PurchaseOrder } from "../../schemas/purchase-order.schema";
import { PurchaseOrderItem } from "../../schemas/purchase-order-item.schema";
import { PageRequest } from "@/common/dto/page.request.dto";
import { IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class QueryOrdersWithUnmanufacturedItemsRequestDto extends PageRequest {
  @ApiProperty({ required: false, default: "" })
  @IsOptional()
  @Type(() => String)
  search: string = "";
}

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

export class QueryOrdersWithUnmanufacturedItemsResponseDto extends Base {
  subPurchaseOrders: SubPurchaseOrderRes[];
  purchaseOrder: PurchaseOrder;
}
