import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {
  IsDate,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
} from "class-validator";
import mongoose, { HydratedDocument } from "mongoose";
import { PurchaseOrder } from "./purchase-order.schema";
import { Product } from "./product.schema";

export enum SubPurchaseOrderStatus {
  PendingApproval = "PENDINGAPPROVAL",
  Approved = "APPROVED",
  Scheduled = "SCHEDULED",
  Cancelled = "CANCELLED",
  InProduction = "INPRODUCTION",
  Paused = "PAUSED",
  PartiallyCompleted = "PARTIALLYCOMPLETED",
  Completed = "COMPLETED",
  InDelivery = "INDELIVERY",
  Delivered = "DELIVERED",
}

@Schema({ timestamps: true })
export class SubPurchaseOrder extends BaseSchema {
  @Prop({ required: true, unique: true })
  @IsString()
  code: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: PurchaseOrder.name,
  })
  @IsMongoId()
  purchaseOrder: mongoose.Schema.Types.ObjectId | PurchaseOrder;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Product.name,
  })
  @IsMongoId()
  product: mongoose.Schema.Types.ObjectId | Product;

  @Prop({ required: true })
  @IsDate()
  deliveryDate: Date;

  @Prop({ required: true })
  @IsEnum(SubPurchaseOrderStatus)
  status: SubPurchaseOrderStatus;

  @Prop({ required: true })
  @IsOptional()
  @IsString()
  note: string = "";
}

export type SubPurchaseOrderDocument = HydratedDocument<SubPurchaseOrder>;

export const SubPurchaseOrderSchema = SchemaFactory.createForClass(
  SubPurchaseOrder,
).plugin(
  softDeletePlugin,
);
