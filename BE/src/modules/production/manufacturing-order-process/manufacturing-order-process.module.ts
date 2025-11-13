import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ManufacturingOrderProcessController } from "./manufacturing-order-process.controller";
import { ManufacturingOrderProcessService } from "./manufacturing-order-process.service";
import {
  ManufacturingOrderProcess,
  ManufacturingOrderProcessSchema,
} from "./schemas/manufacturing-order-process.schema";
import {
  ManufacturingOrder,
  ManufacturingOrderSchema,
} from "../manufacturing-order/schemas/manufacturing-order.schema"; // Import MO

import {
  CorrugatorProcess,
  CorrugatorProcessSchema,
} from "@/modules/corrugator-process/schemas/corrugator-process.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ManufacturingOrderProcess.name,
        schema: ManufacturingOrderProcessSchema,
      },
      // Import MO schema để service có thể cập nhật trạng thái tổng thể
      { name: ManufacturingOrder.name, schema: ManufacturingOrderSchema },

      { name: CorrugatorProcess.name, schema: CorrugatorProcessSchema },
    ]),
  ],
  controllers: [ManufacturingOrderProcessController],
  providers: [ManufacturingOrderProcessService],
})
export class ManufacturingOrderProcessModule {}
