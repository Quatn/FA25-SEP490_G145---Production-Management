import { Module } from "@nestjs/common";
import { ManufacturingOrderController } from "./manufacturing-order.controller";
import { ManufacturingOrderService } from "./manufacturing-order.service";
import { MongooseModule } from "@nestjs/mongoose";
import {
  ManufacturingOrder,
  ManufacturingOrderSchema,
} from "../schemas/manufacturing-order.schema";
import { PurchaseOrderItemModule } from "../purchase-order-item/purchase-order-item.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ManufacturingOrder.name, schema: ManufacturingOrderSchema },
    ]),
    PurchaseOrderItemModule,
  ],
  controllers: [ManufacturingOrderController],
  providers: [ManufacturingOrderService],
  exports: [ManufacturingOrderService],
})
export class ManufacturingOrderModule {}
