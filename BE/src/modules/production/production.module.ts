import { Module } from "@nestjs/common";
import { ManufacturingOrderModule } from "./manufacturing-order/manufacturing-order.module";
import { ManufacturingProcessModule } from "./manufacturing-process/manufacturing-process.module";
import { ManufacturingOrderProcessModule } from "./manufacturing-order-process/manufacturing-order-process.module";
import { PurchaseOrderItemModule } from "./purchase-order-item/purchase-order-item.module";
import { ProductModule } from "./product/product.module";
import { WareModule } from "./ware/ware.module";
import { CorrugatorProcessModule } from "./corrugator-process/corrugator-process.module";

@Module({
  imports: [
    ManufacturingOrderModule,
    ManufacturingProcessModule,
    ManufacturingOrderProcessModule,
    PurchaseOrderItemModule,
    ProductModule,
    WareModule,
    CorrugatorProcessModule,
  ],
})
export class ProductionModule {}
