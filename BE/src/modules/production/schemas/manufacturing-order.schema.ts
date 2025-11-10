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

@Schema({ timestamps: true })
export class ManufacturingOrder extends BaseSchema {
  @ApiProperty()
  @Prop({ required: true, unique: true })
  @IsString()
  code: string;

  @ApiProperty({
    type: mongoose.Schema.Types.ObjectId,
    description: "ObjectId by default, PurchaseOrderItem when populated",
  })
  @Prop({
    required: true,
    unique: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: PurchaseOrderItem.name,
  })
  @IsMongoId()
  purchaseOrderItem: mongoose.Schema.Types.ObjectId | PurchaseOrderItem;

  @Prop({ required: true })
  @IsDate()
  manufacturingDate: Date;

  @Prop({ required: true, type: Date, default: null })
  @IsOptional()
  @IsDate()
  requestedDatetime: Date | null;

  @Prop({ required: true })
  @IsString()
  corrugatorLine: string;

  @Prop({ required: true })
  @IsNumber()
  manufacturedAmount: number;

  // TODO: Change this to an enum, maybe
  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsString()
  manufacturingDirective: string | null;

  @Prop({ required: false, default: "" })
  @IsOptional()
  @IsString()
  note: string = "";
}

export type ManufacturingOrderDocument = HydratedDocument<ManufacturingOrder>;

export const ManufacturingOrderSchema = SchemaFactory.createForClass(
  ManufacturingOrder,
).plugin(softDeletePlugin);
