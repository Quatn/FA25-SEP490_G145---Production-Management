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

export enum PurchaseOrderItemStatus {
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
  @Prop({ required: true, unique: true })
  @IsString()
  code: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: SubPurchaseOrder.name,
  })
  @IsMongoId()
  subPurchaseOrder: mongoose.Schema.Types.ObjectId | SubPurchaseOrder;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Ware.name,
  })
  @IsMongoId()
  ware: mongoose.Schema.Types.ObjectId | Ware;

  @Prop({ required: true })
  @IsNumber()
  amount: number;

  @Prop({ required: false, type: Number, default: 0 })
  @IsOptional()
  @IsNumber()
  numberOfBlanks: number = 0;

  @Prop({ required: false, type: Number, default: 0 })
  @IsOptional()
  @IsNumber()
  longitudinalCutCount: number = 0;

  @Prop({ required: false, type: Number, default: 0 })
  @IsOptional()
  @IsNumber()
  runningLength: number = 0;

  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsNumber()
  faceLayerPaperWeight: number | null;

  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsNumber()
  EFlutePaperWeight: number | null;

  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsNumber()
  EBLinerLayerPaperWeight: number | null;

  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsNumber()
  BFlutePaperWeight: number | null;

  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsNumber()
  BACLinerLayerPaperWeight: number | null;

  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsNumber()
  ACFlutePaperWeight: number | null;

  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsNumber()
  backLayerPaperWeight: number | null;

  @Prop({ required: false, type: Number, default: 0 })
  @IsOptional()
  @IsNumber()
  totalVolume: number = 0;

  @Prop({ required: false, type: Number, default: 0 })
  @IsOptional()
  @IsNumber()
  totalWeight: number = 0;

  @Prop({
    required: true,
    enum: PurchaseOrderItemStatus,
    default: PurchaseOrderItemStatus.PendingApproval,
  })
  @IsEnum(PurchaseOrderItemStatus)
  status: PurchaseOrderItemStatus;

  @Prop({ required: false, default: "" })
  @IsOptional()
  @IsString()
  note: string = "";
}

export type PurchaseOrderItemDocument = HydratedDocument<PurchaseOrderItem>;

export const PurchaseOrderItemSchema = SchemaFactory.createForClass(
  PurchaseOrderItem,
)
  .plugin(
    softDeletePlugin,
  );
