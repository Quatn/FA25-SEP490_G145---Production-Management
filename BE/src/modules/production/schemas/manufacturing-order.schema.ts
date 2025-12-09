import {
  IsDate,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  IsObject,
  IsEnum,
} from "class-validator";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { BaseDenormalizedSchema } from "@/common/schemas/base.denormalized.schema";
import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { PurchaseOrderItem } from "./purchase-order-item.schema";
import { ApiProperty } from "@nestjs/swagger";
import { RecalculateFlagPlugin } from "@/common/plugins/set-recalculate-flag-on-save.plugin";

export enum CorrugatorProcessStatus {
  NOTSTARTED = "NOTSTARTED",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  OVERCOMPLETED = "OVERCOMPLETED",
  PAUSED = "PAUSED",
  CANCELLED = "CANCELLED",
}

export class CorrugatorProcess {
  @Prop({
    required: true,
    enum: CorrugatorProcessStatus,
    default: CorrugatorProcessStatus.NOTSTARTED,
  })
  status: CorrugatorProcessStatus;

  @Prop({ required: true, default: 0 })
  manufacturedAmount: number;

  @Prop({ required: true, default: 0 })
  actualPaperWidth: number;

  @Prop({ required: true, default: 0 })
  actualRunningLength: number;

  @Prop({ required: false, default: "" })
  note: string;
}
export type CorrugatorProcessDocument = HydratedDocument<CorrugatorProcess>;

export enum CorrugatorLine {
  L5 = "LINE5",
  L7 = "LINE7",
}

export enum ManufacturingOrderDirectives {
  Pause = "PAUSE",
  Compensate = "COMPENSATE",
  Cancel = "CANCEL",
  Mandatory = "MANDATORY",
}

export enum ManufacturingOrderApprovalStatus {
  Draft = "DRAFT",
  PendingApproval = "PENDINGAPPROVAL",
  Approved = "APPROVED",
}

// LEGACY CODE: KEPT DUE TO TIME LIMITATION, AVOID USING IF POSSIBLE --[[
/** @deprecated MO wont have *operative* status, it is supposed to derive that from other objects is it associated with */
export enum OrderStatus {
  NOTSTARTED = "NOTSTARTED",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  OVERCOMPLETED = "OVERCOMPLETED",
  PAUSED = "PAUSED",
  CANCELLED = "CANCELLED",
}
// ]]---

@Schema({ timestamps: true })
export class ManufacturingOrder extends BaseDenormalizedSchema {
  @ApiProperty()
  @Prop({ required: true })
  @IsString()
  code: string;

  @ApiProperty({
    type: String,
    description:
      "ObjectId normally, populated PurchaseOrderItem when populated",
  })
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: PurchaseOrderItem.name,
  })
  @IsMongoId()
  purchaseOrderItem: mongoose.Types.ObjectId | PurchaseOrderItem;

  @ApiProperty()
  @Prop({
    required: true,
    enum: ManufacturingOrderApprovalStatus,
    default: ManufacturingOrderApprovalStatus.Draft,
  })
  @IsEnum(ManufacturingOrderApprovalStatus)
  approvalStatus: ManufacturingOrderApprovalStatus;

  @ApiProperty({
    description: "Corrugator Process Object",
    type: String,
  })
  @Prop({
    required: true,
  })
  @IsObject()
  corrugatorProcess: CorrugatorProcess;

  @ApiProperty()
  @Prop({ required: true })
  @IsDate()
  manufacturingDate: Date;

  @ApiProperty()
  @Prop({ required: false, type: Date, default: null })
  @IsOptional()
  @IsDate()
  manufacturingDateAdjustment?: Date | null;

  @ApiProperty()
  @Prop({ required: false, type: Date, default: null })
  @IsOptional()
  @IsDate()
  requestedDatetime?: Date | null;

  @ApiProperty()
  @Prop({
    required: true,
    enum: CorrugatorLine,
    default: CorrugatorLine.L5,
  })
  @IsEnum(CorrugatorLine)
  corrugatorLine: CorrugatorLine;

  @ApiProperty()
  @Prop({
    required: false,
    enum: CorrugatorLine,
    type: String,
    default: null,
  })
  @IsOptional()
  corrugatorLineAdjustment?: CorrugatorLine | null;

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

  @ApiProperty()
  @Prop({
    required: false,
    enum: ManufacturingOrderDirectives,
    type: String,
    default: null,
  })
  @IsOptional()
  manufacturingDirective?: ManufacturingOrderDirectives | null;

  @ApiProperty()
  @Prop({ default: "" })
  @IsOptional()
  @IsString()
  note?: string;

  /** @deprecated MO wont have *operative* status, it is supposed to derive that from other objects is it associated with */
  @ApiProperty({ enum: OrderStatus })
  @Prop({
    required: true,
    enum: OrderStatus,
    default: OrderStatus.NOTSTARTED,
  })
  overallStatus: OrderStatus;
}

export type ManufacturingOrderDocument = HydratedDocument<ManufacturingOrder>;

export const ManufacturingOrderSchema = SchemaFactory.createForClass(
  ManufacturingOrder,
)
  .plugin(softDeletePlugin)
  .plugin(RecalculateFlagPlugin);

ManufacturingOrderSchema.index(
  { code: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
