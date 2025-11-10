import mongoose, { Document, isValidObjectId, Mongoose } from "mongoose";
import { ManufacturingOrder } from "../../schemas/manufacturing-order.schema";
import {
  PurchaseOrderItem,
  PurchaseOrderItemStatus,
} from "../../schemas/purchase-order-item.schema";
import { Ware } from "../../schemas/ware.schema";
import {
  IsDate,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { ApiOkResponse, ApiProperty, ApiResponse } from "@nestjs/swagger";
import { SubPurchaseOrder } from "../../schemas/sub-purchase-order.schema";
import { PurchaseOrder } from "../../schemas/purchase-order.schema";
import { Customer } from "../../schemas/customer.schema";
import check from "check-types";
import { isRefPopulated } from "@/common/utils/populate-check";

// Change the ref fields from id or object (unpopulated or populated) to just object since you are supposed to populate all of the full detail dto's fields
class PopulatedPurchaseOrder extends PurchaseOrder {
  @ApiProperty()
  @ApiProperty({ type: Customer, description: "Populated customer" })
  declare customer: Customer;

  constructor(order: PurchaseOrder) {
    if (!isRefPopulated(order.customer)) {
      throw Error(
        "mo.purchaseOrderItem.subPurchaseOrder.purchaseOrder.customer must be populated in order to be used in FullDetailManufacturingOrderDto",
      );
    }
    super();
    Object.assign(this, order);
    this.customer = order.customer as Customer;
  }
}

class PopulatedSubPurchaseOrder extends SubPurchaseOrder {
  @ApiProperty({
    type: PopulatedPurchaseOrder,
    description: "Populated purchaseOrder",
  })
  declare purchaseOrder: PopulatedPurchaseOrder;

  constructor(order: SubPurchaseOrder) {
    if (!isRefPopulated(order.purchaseOrder)) {
      throw Error(
        "mo.purchaseOrderItem.subPurchaseOrder.purchaseOrder must be populated in order to be used in FullDetailManufacturingOrderDto",
      );
    }
    super();
    Object.assign(this, order);
    this.purchaseOrder = new PopulatedPurchaseOrder(
      order.purchaseOrder as PurchaseOrder,
    );
  }
}

class PopulatedPurchaseOrderItem extends PurchaseOrderItem {
  @ApiProperty({
    type: PopulatedSubPurchaseOrder,
    description: "Populated subPurchaseOrder",
  })
  declare subPurchaseOrder: PopulatedSubPurchaseOrder;

  constructor(order: PurchaseOrderItem) {
    if (!isRefPopulated(order.subPurchaseOrder)) {
      throw Error(
        "mo.purchaseOrderItem.subPurchaseOrder must be populated in order to be used in FullDetailManufacturingOrderDto",
      );
    }
    super();
    Object.assign(this, order);
    this.subPurchaseOrder = new PopulatedSubPurchaseOrder(
      order.subPurchaseOrder as SubPurchaseOrder,
    );
  }
}

export class FullDetailManufacturingOrderDto extends ManufacturingOrder {
  @ApiProperty({
    type: PopulatedPurchaseOrderItem,
    description: "Populated purchaseOrderItem",
  })
  declare purchaseOrderItem: PopulatedPurchaseOrderItem;

  constructor(order: ManufacturingOrder) {
    if (!isRefPopulated(order.purchaseOrderItem)) {
      throw Error(
        "mo.purchaseOrderItem must be populated in order to be used in FullDetailManufacturingOrderDto",
      );
    }
    super();
    Object.assign(this, order);
    this.purchaseOrderItem = new PopulatedPurchaseOrderItem(
      order.purchaseOrderItem as PurchaseOrderItem,
    );
  }
}
