import { Module } from "@nestjs/common";

// Import các Module con đã tạo trước đó
import { ManufacturingOrderModule } from "./manufacturing-order/manufacturing-order.module";
import { ManufacturingProcessModule } from "./manufacturing-process/manufacturing-process.module";
import { ManufacturingOrderProcessModule } from "./manufacturing-order-process/manufacturing-order-process.module";
import { PurchaseOrderItemModule } from "../purchase-order-item/purchase-order-item.module";
import { WareModule } from "../ware/ware.module";

import { CorrugatorProcessModule } from "@/modules/corrugator-process/corrugator-process.module";

@Module({
  imports: [
    // Bổ sung các module còn thiếu
    ManufacturingOrderModule,
    ManufacturingProcessModule,
    ManufacturingOrderProcessModule,
    PurchaseOrderItemModule,
    WareModule,

    CorrugatorProcessModule,
  ],

  exports: [
    ManufacturingOrderModule,
    ManufacturingProcessModule,
    ManufacturingOrderProcessModule,
    PurchaseOrderItemModule,
    WareModule,

    CorrugatorProcessModule,
  ],
})
export class ProductionModule {}
