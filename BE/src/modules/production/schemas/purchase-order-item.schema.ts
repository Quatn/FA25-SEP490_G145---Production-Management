import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import mongoose, { HydratedDocument } from "mongoose";
import { SubPurchaseOrder } from "./sub-purchase-order.schema";
import { Ware } from "./ware.schema";
import { BaseDenormalizedSchema } from "@/common/schemas/base.denormalized.schema";
import { ApiProperty } from "@nestjs/swagger";
import { PurchaseOrderStatus } from "./purchase-order.schema";

export enum PurchaseOrderItemStatus {
  Draft = "DRAFT",
  PendingApproval = "PENDINGAPPROVAL",
  Approved = "APPROVED",
  Scheduled = "SCHEDULED",
  OnHold = "ONHOLD",
  Cancelled = "CANCELLED",
  InProduction = "INPRODUCTION",
  Paused = "PAUSED",
  FinishedProduction = "FINISHEDPRODUCTION",
  QualityCheck = "QUALITYCHECK",
  Completed = "COMPLETED",
}

@Schema({ timestamps: true })
export class PurchaseOrderItem extends BaseDenormalizedSchema {
  @ApiProperty()
  @Prop({ required: true, unique: true })
  @IsString()
  code: string;

  @ApiProperty()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: SubPurchaseOrder.name,
  })
  @IsMongoId()
  subPurchaseOrder: mongoose.Types.ObjectId | SubPurchaseOrder;

  @ApiProperty()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Ware.name,
  })
  @IsMongoId()
  ware: mongoose.Types.ObjectId | Ware;

  @ApiProperty()
  @Prop({ required: true })
  @IsNumber()
  amount: number;

  @ApiProperty()
  @Prop({ required: false, type: Number, default: 0 })
  @IsOptional()
  @IsNumber()
  numberOfBlanks: number = 0;

  @ApiProperty()
  @Prop({ required: false, type: Number, default: 0 })
  @IsOptional()
  @IsNumber()
  longitudinalCutCount: number = 0;

  @ApiProperty()
  @Prop({ required: false, type: Number, default: 0 })
  @IsOptional()
  @IsNumber()
  runningLength: number = 0;

  @ApiProperty()
  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsNumber()
  faceLayerPaperWeight: number | null;

  @ApiProperty()
  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsNumber()
  EFlutePaperWeight: number | null;

  @ApiProperty()
  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsNumber()
  EBLinerLayerPaperWeight: number | null;

  @ApiProperty()
  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsNumber()
  BFlutePaperWeight: number | null;

  @ApiProperty()
  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsNumber()
  BACLinerLayerPaperWeight: number | null;

  @ApiProperty()
  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsNumber()
  ACFlutePaperWeight: number | null;

  @ApiProperty()
  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsNumber()
  backLayerPaperWeight: number | null;

  @ApiProperty()
  @Prop({ required: false, type: Number, default: 0 })
  @IsOptional()
  @IsNumber()
  totalVolume: number = 0;

  @ApiProperty()
  @Prop({ required: false, type: Number, default: 0 })
  @IsOptional()
  @IsNumber()
  totalWeight: number = 0;

  @ApiProperty({
    default: PurchaseOrderItemStatus.Draft,
    enum: PurchaseOrderStatus,
  })
  @Prop({
    required: true,
    enum: PurchaseOrderItemStatus,
    default: PurchaseOrderItemStatus.Draft,
  })
  @IsEnum(PurchaseOrderItemStatus)
  status: PurchaseOrderItemStatus;

  @ApiProperty()
  @Prop({ required: false, default: "" })
  @IsOptional()
  @IsString()
  note: string = "";
}

export type PurchaseOrderItemDocument = HydratedDocument<PurchaseOrderItem>;

export const PurchaseOrderItemSchema =
  SchemaFactory.createForClass(PurchaseOrderItem).plugin(softDeletePlugin);
