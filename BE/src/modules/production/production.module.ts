import { Module } from "@nestjs/common";
import { ManufacturingOrderModule } from "./manufacturing-order/manufacturing-order.module";
import { ProductionDevModule } from "./dev/dev.module";

@Module({
  imports: [
    ManufacturingOrderModule,
    ...(process.env.NODE_ENV === "development" ? [ProductionDevModule] : []),
  ],
})
export class ProductionModule { }
