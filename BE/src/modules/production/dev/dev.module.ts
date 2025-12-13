import { Module, UseGuards } from "@nestjs/common";
import { ProductionDevController } from "./dev.controller";
import { ManufacturingOrderModule } from "../manufacturing-order/manufacturing-order.module";
import { ProductionDevService } from "./dev.service";
import { MongooseModule } from "@nestjs/mongoose";
import {
  ManufacturingOrder,
  ManufacturingOrderSchema,
} from "../schemas/manufacturing-order.schema";
import {
  FluteCombination,
  FluteCombinationSchema,
} from "../schemas/flute-combination.schema";
import {
  WareManufacturingProcessType,
  WareManufacturingProcessTypeSchema,
} from "../schemas/ware-manufacturing-process-type.schema";
import { PrintColor, PrintColorSchema } from "../schemas/print-color.schema";
import {
  WareFinishingProcessType,
  WareFinishingProcessTypeSchema,
} from "../schemas/ware-finishing-process-type.schema";
import { Customer, CustomerSchema } from "../schemas/customer.schema";
import {
  PurchaseOrder,
  PurchaseOrderSchema,
} from "../schemas/purchase-order.schema";
import { Product, ProductSchema } from "../schemas/product.schema";
import { Ware, WareSchema } from "../schemas/ware.schema";
import {
  SubPurchaseOrder,
  SubPurchaseOrderSchema,
} from "../schemas/sub-purchase-order.schema";
import {
  PurchaseOrderItem,
  PurchaseOrderItemSchema,
} from "../schemas/purchase-order-item.schema";

// IMPORTANT: This module is only available in development mode and should only be imported conditionally.
// Its controller does use a guard that blocks access in non-development mode, but the best practice would be to not import it in the first place.
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ManufacturingOrder.name, schema: ManufacturingOrderSchema },
      { name: FluteCombination.name, schema: FluteCombinationSchema },
      {
        name: WareManufacturingProcessType.name,
        schema: WareManufacturingProcessTypeSchema,
      },
      { name: PrintColor.name, schema: PrintColorSchema },
      {
        name: WareFinishingProcessType.name,
        schema: WareFinishingProcessTypeSchema,
      },
      { name: Customer.name, schema: CustomerSchema },
      { name: PurchaseOrder.name, schema: PurchaseOrderSchema },
      { name: Ware.name, schema: WareSchema },
      { name: Product.name, schema: ProductSchema },
      { name: SubPurchaseOrder.name, schema: SubPurchaseOrderSchema },
      { name: PurchaseOrderItem.name, schema: PurchaseOrderItemSchema },
    ]),
    ManufacturingOrderModule,
  ],
  controllers: [ProductionDevController],
  providers: [ProductionDevService],
})
export class ProductionDevModule { }
