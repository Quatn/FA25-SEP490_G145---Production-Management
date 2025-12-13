import { Module } from "@nestjs/common";
import { ManufacturingOrderModule } from "./manufacturing-order/manufacturing-order.module";
import { ProductModule } from "./product/product.module";
import { WareModule } from "./ware/ware.module";
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
import { DeliveryNoteModule } from "./delivery-note/delivery-note.module";
import { OrderFinishingProcessModule } from "./order-finishing-process/order-finishing-process.module";
import { ProductionCommonModule } from "./common/common.module";

@Module({
  imports: [
    ManufacturingOrderModule,
    PurchaseOrderItemModule,
    ProductModule,
    WareModule,
    PurchaseOrderModule,
    SubPurchaseOrderModule,
    PurchaseOrderItemModule,
    WareManufacturingProcessTypeModule,
    WareFinishingProcessTypeModule,
    CustomerModule,
    ProductTypeModule,
    FluteCombinationModule,
    CustomerModule,
    PrintColorModule,
    DeliveryNoteModule,
    OrderFinishingProcessModule,
    ProductionCommonModule,
    ...(process.env.NODE_ENV === "development" ? [ProductionDevModule] : []),
  ],
})
export class ProductionModule { }
