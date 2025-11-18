import { Module } from "@nestjs/common";
import { ManufacturingOrderModule } from "./manufacturing-order/manufacturing-order.module";
import { ManufacturingOrderProcessModule } from "./manufacturing-order-process/manufacturing-order-process.module";
import { ProductModule } from "./product/product.module";
import { WareModule } from "./ware/ware.module";
// import { CorrugatorProcessModule } from "./corrugator-process/corrugator-process.module";
import { ProductionDevModule } from "./dev/dev.module";
import { PurchaseOrderModule } from "./purchase-order/purchase-order.module";
import { SubPurchaseOrderModule } from "./sub-purchase-order/sub-purchase-order.module";
import { PurchaseOrderItemModule } from "./purchase-order-item/purchase-order-item.module";
import { CustomerModule } from "./customer/customer.module";
import { WareManufacturingProcessTypeModule } from "./ware-manufacturing-process-type/ware-manufacturing-process-type.module";
import { WareFinishingProcessTypeModule } from "./ware-finishing-process-type/ware-finishing-process-type.module";
import { ProductTypeModule } from "./product-type/product-type.module";
import { FluteCombinationModule } from "./flute-combination/flute-combination.module";
import { PrintColorModule } from "./print-color/print-color.module";

@Module({
  imports: [
    ManufacturingOrderModule,
    ManufacturingOrderProcessModule,
    PurchaseOrderItemModule,
    ProductModule,
    WareModule,
    // CorrugatorProcessModule,
    PurchaseOrderModule,
    SubPurchaseOrderModule,
    PurchaseOrderItemModule,
    WareManufacturingProcessTypeModule,
    WareFinishingProcessTypeModule,
    ProductionDevModule,
    ...(process.env.NODE_ENV === "development" ? [ProductionDevModule] : []),
    CustomerModule,
    ProductTypeModule,
    FluteCombinationModule,
    CustomerModule,
    PrintColorModule,
  ],
})
export class ProductionModule { }
