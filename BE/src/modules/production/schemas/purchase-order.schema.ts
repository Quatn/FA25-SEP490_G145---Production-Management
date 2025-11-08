import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsDate, IsEnum, IsOptional, IsString } from "class-validator";
import mongoose, { HydratedDocument } from "mongoose";
import { Customer } from "./customer.schema";

export enum PurchaseOrderStatus {
  Draft = "DRAFT",
  PendingApproval = "PENDINGAPPROVAL",
  Approved = "APPROVED",
  Scheduled = "SCHEDULED",
  Cancelled = "CANCELLED",
  InProduction = "INPRODUCTION",
  Paused = "PAUSED",
  PartiallyCompleted = "PARTIALLYCOMPLETED",
  Completed = "COMPLETED",
  PartiallyFinished = "PARTIALLYFINISHED",
  Finished = "FINISHED",
  Closed = "CLOSED",
}

@Schema({ timestamps: true })
export class PurchaseOrder extends BaseSchema {
  @Prop({ required: true, unique: true })
  @IsString()
  code: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Customer.name,
  })
  @IsOptional()
  customer: mongoose.Schema.Types.ObjectId | Customer;

  @Prop({ required: true })
  @IsDate()
  orderDate: Date;

  @Prop({ required: true })
  @IsString()
  deliveryAdress: string;

  @Prop({ required: true })
  @IsString()
  paymentTerms: string;

  @Prop({ required: true })
  @IsEnum(PurchaseOrderStatus)
  status: PurchaseOrderStatus;

  @Prop({ required: true })
  @IsOptional()
  @IsString()
  note: string = "";
}

export type PurchaseOrderDocument = HydratedDocument<PurchaseOrder>;

export const PurchaseOrderSchema = SchemaFactory.createForClass(PurchaseOrder)
  .plugin(
    softDeletePlugin,
  );
