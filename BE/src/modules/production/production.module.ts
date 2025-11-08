import { Module } from "@nestjs/common";
import { ManufacturingOrderModule } from "./manufacturing-order/manufacturing-order.module";

@Module({
  imports: [ManufacturingOrderModule],
})
export class ProductionModule { }
