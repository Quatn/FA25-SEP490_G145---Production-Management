import { Module } from "@nestjs/common";
import { ProductionRecalculateService } from "./recalculate.service";
import { MongooseModule } from "@nestjs/mongoose";
import {
  ManufacturingOrder,
  ManufacturingOrderSchema,
} from "../../schemas/manufacturing-order.schema";
import { PurchaseOrderItemModule } from "../../purchase-order-item/purchase-order-item.module";
import {
  PurchaseOrderItem,
  PurchaseOrderItemSchema,
} from "../../schemas/purchase-order-item.schema";
import { Ware, WareSchema } from "../../schemas/ware.schema";
import { OrderFinishingProcess, OrderFinishingProcessSchema } from "../../schemas/order-finishing-process.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ManufacturingOrder.name, schema: ManufacturingOrderSchema },
      { name: PurchaseOrderItem.name, schema: PurchaseOrderItemSchema },
      { name: Ware.name, schema: WareSchema },
      {
        name: OrderFinishingProcess.name,
        schema: OrderFinishingProcessSchema,
      },
    ]),
    PurchaseOrderItemModule,
  ],
  providers: [ProductionRecalculateService],
  exports: [ProductionRecalculateService],
})
export class ProductionRecalculateModule { }
