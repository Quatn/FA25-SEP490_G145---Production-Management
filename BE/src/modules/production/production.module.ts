import { Module } from "@nestjs/common";
import { ManufacturingOrderModule } from "./manufacturing-order/manufacturing-order.module";
import { ProductionDevModule } from "./dev/dev.module";
import { PurchaseOrderModule } from "./purchase-order/purchase-order.module";
import { SubPurchaseOrderModule } from "./sub-purchase-order/sub-purchase-order.module";
import { PurchaseOrderItemModule } from "./purchase-order-item/purchase-order-item.module";
import { WareManufacturingProcessTypeModule } from './ware-manufacturing-process-type/ware-manufacturing-process-type.module';

@Module({
  imports: [
    ManufacturingOrderModule,
    PurchaseOrderModule,
    SubPurchaseOrderModule,
    PurchaseOrderItemModule,
    WareManufacturingProcessTypeModule,
    ...(process.env.NODE_ENV === "development" ? [ProductionDevModule] : []),
  ],
})
export class ProductionModule { }
