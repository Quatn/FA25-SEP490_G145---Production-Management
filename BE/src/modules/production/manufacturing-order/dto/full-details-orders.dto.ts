import { ManufacturingOrder } from "../../schemas/manufacturing-order.schema";
import { PurchaseOrderItem } from "../../schemas/purchase-order-item.schema";
import { Ware } from "../../schemas/ware.schema";
import { ApiProperty } from "@nestjs/swagger";
import { SubPurchaseOrder } from "../../schemas/sub-purchase-order.schema";
import { PurchaseOrder } from "../../schemas/purchase-order.schema";
import { Customer } from "../../schemas/customer.schema";
import { isRefPopulated } from "@/common/utils/populate-check";
import { Product } from "../../schemas/product.schema";
import { FluteCombination } from "../../schemas/flute-combination.schema";
import { WareFinishingProcessType } from "../../schemas/ware-finishing-process-type.schema";

// Change the ref fields from id or object (unpopulated or populated) to just object since you are supposed to populate all of the full detail dto's fields
class PopulatedPurchaseOrder extends PurchaseOrder {
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
    this.customer = order.customer;
  }
}

class PopulatedWare extends Ware {
  @ApiProperty({
    type: FluteCombination,
    description: "Populated fluteCombination",
  })
  declare fluteCombination: FluteCombination;

  @ApiProperty({
    type: Array<WareFinishingProcessType>,
    description: "Populated fluteCombination",
  })
  declare finishingProcesses: WareFinishingProcessType[];

  constructor(ware: Ware) {
    if (!isRefPopulated(ware.fluteCombination)) {
      throw Error(
        "mo.purchaseOrderItem.ware.fluteCombination must be populated in order to be used in FullDetailManufacturingOrderDto",
      );
    }
    super();
    Object.assign(this, ware);
    this.fluteCombination = ware.fluteCombination;
    this.finishingProcesses =
      ware.finishingProcesses as WareFinishingProcessType[];
  }
}

class PopulatedSubPurchaseOrder extends SubPurchaseOrder {
  @ApiProperty({
    type: PopulatedPurchaseOrder,
    description: "Populated purchaseOrder",
  })
  declare purchaseOrder: PopulatedPurchaseOrder;

  @ApiProperty({
    type: Product,
    description: "Populated product",
  })
  declare product: Product;

  constructor(order: SubPurchaseOrder) {
    if (!isRefPopulated(order.purchaseOrder)) {
      throw Error(
        "mo.purchaseOrderItem.subPurchaseOrder.purchaseOrder must be populated in order to be used in FullDetailManufacturingOrderDto",
      );
    }
    if (!isRefPopulated(order.product)) {
      throw Error(
        "mo.purchaseOrderItem.subPurchaseOrder.product must be populated in order to be used in FullDetailManufacturingOrderDto",
      );
    }
    super();
    Object.assign(this, order);
    this.purchaseOrder = new PopulatedPurchaseOrder(order.purchaseOrder);
    this.product = order.product;
  }
}

class PopulatedPurchaseOrderItem extends PurchaseOrderItem {
  @ApiProperty({
    type: PopulatedSubPurchaseOrder,
    description: "Populated subPurchaseOrder",
  })
  declare subPurchaseOrder: PopulatedSubPurchaseOrder;

  @ApiProperty({
    type: PopulatedWare,
    description: "Populated ware",
  })
  declare ware: PopulatedWare;

  constructor(order: PurchaseOrderItem) {
    if (!isRefPopulated(order.subPurchaseOrder)) {
      throw Error(
        "mo.purchaseOrderItem.subPurchaseOrder must be populated in order to be used in FullDetailManufacturingOrderDto",
      );
    }
    if (!isRefPopulated(order.ware)) {
      throw Error(
        "mo.purchaseOrderItem.ware must be populated in order to be used in FullDetailManufacturingOrderDto",
      );
    }
    super();
    Object.assign(this, order);
    this.subPurchaseOrder = new PopulatedSubPurchaseOrder(
      order.subPurchaseOrder,
    );
    this.ware = new PopulatedWare(order.ware);
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
      order.purchaseOrderItem,
    );
  }
}
