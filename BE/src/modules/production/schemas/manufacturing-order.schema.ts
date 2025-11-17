import {
  IsDate,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
} from "class-validator";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { BaseDenormalizedSchema } from "@/common/schemas/base.denormalized.schema";
import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { ManufacturingOrderProcess } from "./manufacturing-order-process.schema";
import { CorrugatorProcess } from "./corrugator-process.schema";
import { PurchaseOrderItem } from "./purchase-order-item.schema";
import { ApiProperty } from "@nestjs/swagger";

export enum OrderStatus {
  NOTSTARTED = "NOTSTARTED",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  OVERCOMPLETED = "OVERCOMPLETED",
  PAUSED = "PAUSED",
  CANCELLED = "CANCELLED",
}

@Schema({ timestamps: true })
export class ManufacturingOrder extends BaseDenormalizedSchema {
  @ApiProperty()
  @Prop({ required: true })
  @IsString()
  code: string;

  @ApiProperty({ enum: OrderStatus })
  @Prop({
    required: true,
    enum: OrderStatus,
    default: OrderStatus.NOTSTARTED,
  })
  overallStatus: OrderStatus;

  @ApiProperty({
    type: [String],
    description: "List of ManufacturingOrderProcess ObjectIds",
  })
  @Prop({
    type: [{ type: Types.ObjectId, ref: ManufacturingOrderProcess.name }],
    required: true,
    default: [],
  })
  @IsArray()
  @IsMongoId({ each: true })
  processes: Types.ObjectId[];

  @ApiProperty({
    description: "Corrugator Process ObjectId",
    type: String,
  })
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: CorrugatorProcess.name,
  })
  @IsMongoId()
  corrugatorProcess: Types.ObjectId | CorrugatorProcess;

  @ApiProperty({
    type: String,
    description: "ObjectId normally, populated PurchaseOrderItem when populated",
  })
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: PurchaseOrderItem.name,
  })
  @IsMongoId()
  purchaseOrderItem: mongoose.Types.ObjectId | PurchaseOrderItem;

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

  // This should have its own table or at least be an enum
  @ApiProperty()
  @Prop({ required: true })
  @IsNumber()
  corrugatorLine: string;

  @ApiProperty()
  @Prop({ required: false, type: Number, default: null })
  @IsOptional()
  @IsNumber()
  corrugatorLineAdjustment?: number | null;

  @ApiProperty()
  @Prop({ required: true })
  @IsNumber()
  amount: number;

  @ApiProperty()
  @Prop({ type: String, default: null })
  @IsOptional()
  @IsString()
  manufacturingDirective?: string | null;

  @ApiProperty()
  @Prop({ default: "" })
  @IsOptional()
  @IsString()
  note?: string;
}

export type ManufacturingOrderDocument =
  HydratedDocument<ManufacturingOrder>;

export const ManufacturingOrderSchema = SchemaFactory.createForClass(
  ManufacturingOrder,
).plugin(softDeletePlugin);

ManufacturingOrderSchema.index(
  { code: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
