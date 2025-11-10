import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsDate, IsEnum, IsOptional, IsString } from "class-validator";
import mongoose, { HydratedDocument } from "mongoose";
import { Customer } from "./customer.schema";
import { ApiProperty } from "@nestjs/swagger";

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
  @ApiProperty()
  @Prop({ required: true, unique: true })
  @IsString()
  code: string;

  @ApiProperty()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Customer.name,
  })
  @IsOptional()
  customer: mongoose.Schema.Types.ObjectId | Customer;

  @ApiProperty()
  @Prop({ required: true })
  @IsDate()
  orderDate: Date;

  @ApiProperty()
  @Prop({ required: true })
  @IsString()
  deliveryAdress: string;

  @ApiProperty()
  @Prop({ required: true })
  @IsString()
  paymentTerms: string;

  @ApiProperty()
  @Prop({
    required: true,
    enum: PurchaseOrderStatus,
    default: PurchaseOrderStatus.Draft,
  })
  @IsEnum(PurchaseOrderStatus)
  status: PurchaseOrderStatus;

  @ApiProperty()
  @Prop({ required: false, default: "" })
  @IsOptional()
  @IsString()
  note: string = "";
}

export type PurchaseOrderDocument = HydratedDocument<PurchaseOrder>;

export const PurchaseOrderSchema = SchemaFactory.createForClass(PurchaseOrder)
  .plugin(
    softDeletePlugin,
  );
