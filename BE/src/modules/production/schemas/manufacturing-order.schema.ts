import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {
  IsDate,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { PurchaseOrderItem } from "./purchase-order-item.schema";
import { ApiProperty, getSchemaPath } from "@nestjs/swagger";
import { BaseDenormalizedSchema } from "@/common/schemas/base.denormalized.schema";

@Schema({ timestamps: true  })
export class ManufacturingOrder extends BaseDenormalizedSchema {
  @ApiProperty()
  @Prop({ required: true })
  @IsString()
  code: string;

  @ApiProperty({
    type: mongoose.Types.ObjectId,
    description: "ObjectId by default, PurchaseOrderItem when populated",
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
  manufacturingDateAdjustment: Date | null;

  @ApiProperty()
  @Prop({ required: false, type: Date, default: null })
  @IsOptional()
  @IsDate()
  requestedDatetime: Date | null;

  @ApiProperty()
  @Prop({ required: true })
  @IsNumber()
  corrugatorLine: number;

  @ApiProperty()
  @Prop({ required: false, type: Number, default: null })
  @IsOptional()
  @IsNumber()
  corrugatorLineAdjustment: number | null;

  @ApiProperty()
  @Prop({ required: true })
  @IsNumber()
  amount: number;

  // TODO: Change this to an enum, maybe
  @ApiProperty()
  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsString()
  manufacturingDirective: string | null;

  @ApiProperty()
  @Prop({ required: false, default: "" })
  @IsOptional()
  @IsString()
  note: string = "";
}

export type ManufacturingOrderDocument = HydratedDocument<ManufacturingOrder>;

export const ManufacturingOrderSchema = SchemaFactory.createForClass(
  ManufacturingOrder,
).plugin(softDeletePlugin);

ManufacturingOrderSchema.index(
  { code: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
