import { Module } from "@nestjs/common";
import { ManufacturingOrderController } from "./manufacturing-order.controller";
import { ManufacturingOrderService } from "./manufacturing-order.service";
import { MongooseModule } from "@nestjs/mongoose";
import {
  ManufacturingOrder,
  ManufacturingOrderSchema,
} from "../schemas/manufacturing-order.schema";
import { PurchaseOrderItemModule } from "../purchase-order-item/purchase-order-item.module";
import {
  OrderFinishingProcess,
  OrderFinishingProcessSchema,
} from "../schemas/order-finishing-process.schema";
import {
  FinishedGood,
  FinishedGoodSchema,
} from "@/modules/warehouse/schemas/finished-good.schema";
import { ProductionRecalculateModule } from "../common/recalculate/recalculate.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ManufacturingOrder.name, schema: ManufacturingOrderSchema },
      { name: OrderFinishingProcess.name, schema: OrderFinishingProcessSchema },
      {
        name: FinishedGood.name,
        schema: FinishedGoodSchema,
      },
    ]),
    PurchaseOrderItemModule,
    ProductionRecalculateModule,
  ],
  controllers: [ManufacturingOrderController],
  providers: [ManufacturingOrderService],
  exports: [ManufacturingOrderService],
})
export class ManufacturingOrderModule { }
