import { Module } from "@nestjs/common";
import { PurchaseOrderItemController } from "./purchase-order-item.controller";
import { PurchaseOrderItemService } from "./purchase-order-item.service";
import { MongooseModule } from "@nestjs/mongoose";
import {
  PurchaseOrderItem,
  PurchaseOrderItemSchema,
} from "../schemas/purchase-order-item.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PurchaseOrderItem.name, schema: PurchaseOrderItemSchema },
    ]),
  ],

  controllers: [PurchaseOrderItemController],
  providers: [PurchaseOrderItemService],
})
export class PurchaseOrderItemModule {}
