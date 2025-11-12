import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  PurchaseOrderItem,
  PurchaseOrderItemSchema,
} from "./schemas/purchase-order-item.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PurchaseOrderItem.name, schema: PurchaseOrderItemSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class PurchaseOrderItemModule {}

