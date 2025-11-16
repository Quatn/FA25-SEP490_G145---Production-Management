// sub-purchase-order.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SubPurchaseOrderService } from "./sub-purchase-order.service";
import { SubPurchaseOrderController } from "./sub-purchase-order.controller";
import { SubPurchaseOrder, SubPurchaseOrderSchema } from "../schemas/sub-purchase-order.schema";
import { PurchaseOrderItem, PurchaseOrderItemSchema } from "../schemas/purchase-order-item.schema";
import { Product, ProductSchema } from "../schemas/product.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubPurchaseOrder.name, schema: SubPurchaseOrderSchema },
      { name: PurchaseOrderItem.name, schema: PurchaseOrderItemSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [SubPurchaseOrderController],
  providers: [SubPurchaseOrderService],
  exports: [SubPurchaseOrderService],
})
export class SubPurchaseOrderModule {}
