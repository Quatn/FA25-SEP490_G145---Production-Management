import { Module } from "@nestjs/common";
import { PurchaseOrderController } from "./purchase-order.controller";
import { PurchaseOrderService } from "./purchase-order.service";
import { MongooseModule } from "@nestjs/mongoose";
import {
  PurchaseOrder,
  PurchaseOrderSchema,
} from "../schemas/purchase-order.schema";
import {
  PurchaseOrderItem,
  PurchaseOrderItemSchema,
} from "../schemas/purchase-order-item.schema";
import { Customer, CustomerSchema } from "../schemas/customer.schema";
import { Ware, WareSchema } from "../schemas/ware.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PurchaseOrder.name, schema: PurchaseOrderSchema },
      { name: PurchaseOrderItem.name, schema: PurchaseOrderItemSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Ware.name, schema: WareSchema },
    ]),
  ],

  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService],
})
export class PurchaseOrderModule {}
