import { Module } from "@nestjs/common";
import { ManufacturingOrderController } from "./manufacturing-order.controller";
import { ManufacturingOrderService } from "./manufacturing-order.service";
import { MongooseModule } from "@nestjs/mongoose";
import {
  ManufacturingOrder,
  ManufacturingOrderSchema,
} from "../schemas/manufacturing-order.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ManufacturingOrder.name, schema: ManufacturingOrderSchema },
    ]),
  ],
  controllers: [ManufacturingOrderController],
  providers: [ManufacturingOrderService],
  exports: [ManufacturingOrderService],
})
export class ManufacturingOrderModule {}
