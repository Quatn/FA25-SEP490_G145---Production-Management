import { Module } from "@nestjs/common";
import { ManufacturingOrderController } from "./manufacturing-order.controller";
import { ManufacturingOrderService } from "./manufacturing-order.service";
import { MongooseModule } from "@nestjs/mongoose";
import {
  ManufacturingOrder,
  ManufacturingOrderSchema,
} from "../schemas/manufacturing-order.schema";
import {
  ManufacturingOrderProcess,
  ManufacturingOrderProcessSchema,
} from "../schemas/manufacturing-order-process.schema";
import {
  CorrugatorProcess,
  CorrugatorProcessSchema,
} from "../schemas/corrugator-process.schema";
import { PurchaseOrderItemModule } from "../purchase-order-item/purchase-order-item.module";
import {
  OrderFinishingProcess,
  OrderFinishingProcessSchema,
} from "../schemas/order-finishing-process.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ManufacturingOrder.name, schema: ManufacturingOrderSchema },
      {
        name: ManufacturingOrderProcess.name,
        schema: ManufacturingOrderProcessSchema,
      },
      {
        name: CorrugatorProcess.name,
        schema: CorrugatorProcessSchema,
      },
      { name: OrderFinishingProcess.name, schema: OrderFinishingProcessSchema },
    ]),
    PurchaseOrderItemModule,
  ],
  controllers: [ManufacturingOrderController],
  providers: [ManufacturingOrderService],
  exports: [ManufacturingOrderService],
})
export class ManufacturingOrderModule { }
