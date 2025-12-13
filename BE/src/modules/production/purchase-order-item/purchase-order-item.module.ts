import { Module } from "@nestjs/common";
import { PurchaseOrderItemController } from "./purchase-order-item.controller";
import { PurchaseOrderItemService } from "./purchase-order-item.service";
import { MongooseModule } from "@nestjs/mongoose";
import {
  PurchaseOrderItem,
  PurchaseOrderItemSchema,
} from "../schemas/purchase-order-item.schema";
import { Ware, WareSchema } from "../schemas/ware.schema";
import { SubPurchaseOrder, SubPurchaseOrderSchema } from "../schemas/sub-purchase-order.schema";
import { PurchaseOrder, PurchaseOrderSchema } from "../schemas/purchase-order.schema";
import { Product, ProductSchema } from "../schemas/product.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PurchaseOrderItem.name, schema: PurchaseOrderItemSchema },
      { name: Ware.name, schema: WareSchema },
      { name: SubPurchaseOrder.name, schema: SubPurchaseOrderSchema },
      { name: PurchaseOrder.name, schema: PurchaseOrderSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],

  controllers: [PurchaseOrderItemController],
  providers: [PurchaseOrderItemService],
  exports: [PurchaseOrderItemService],
})
export class PurchaseOrderItemModule {}
