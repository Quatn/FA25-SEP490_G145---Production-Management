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
} from "../schemas/manufacturing-order-process.schema"; // Import MOP schema
import { CorrugatorProcess, CorrugatorProcessSchema } from "../schemas/corrugator-process.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ManufacturingOrder.name, schema: ManufacturingOrderSchema },
      // Thêm MOP schema vào imports
      {
        name: ManufacturingOrderProcess.name,
        schema: ManufacturingOrderProcessSchema,
      },
      {
        name: CorrugatorProcess.name,
        schema: CorrugatorProcessSchema,
      },
    ]),
  ],
  controllers: [ManufacturingOrderController],
  providers: [ManufacturingOrderService],
})
export class ManufacturingOrderModule {}
