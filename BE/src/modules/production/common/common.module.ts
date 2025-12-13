import { Module } from "@nestjs/common";
import { ProductionRecalculateModule } from "./recalculate/recalculate.module";

@Module({
  imports: [ProductionRecalculateModule],
})
export class ProductionCommonModule { }
