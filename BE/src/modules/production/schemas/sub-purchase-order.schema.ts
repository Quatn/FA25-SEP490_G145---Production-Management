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
import { ApiProperty } from "@nestjs/swagger";

export enum SubPurchaseOrderStatus {
  Draft = "DRAFT",
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
  @ApiProperty()
  @Prop({ required: true, unique: true })
  @IsString()
  code: string;

  @ApiProperty()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: PurchaseOrder.name,
  })
  @IsMongoId()
  purchaseOrder: mongoose.Types.ObjectId | PurchaseOrder;

  @ApiProperty()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Product.name,
  })
  @IsMongoId()
  product: mongoose.Types.ObjectId | Product;

  @ApiProperty()
  @Prop({ required: true })
  @IsDate()
  deliveryDate: Date;

  @ApiProperty()
  @Prop({
    required: true,
    enum: SubPurchaseOrderStatus,
    default: SubPurchaseOrderStatus.Draft,
  })
  @IsEnum(SubPurchaseOrderStatus)
  status: SubPurchaseOrderStatus;

  @ApiProperty()
  @Prop({ required: false, default: "" })
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
