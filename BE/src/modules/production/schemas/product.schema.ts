import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { Ware } from "@/modules/production/schemas/ware.schema";
import { Customer } from "./customer.schema";
import {
  IsArray,
  IsMongoId,
  IsOptional,
  IsString,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ProductType } from "./product-type.schema";

@Schema({ timestamps: true })
export class Product extends BaseSchema {


  @ApiProperty()
  @Prop({ required: true })
  productLength: number;

  @ApiProperty()
  @Prop({ required: true })
  productWidth: number;

  @ApiProperty()
  @Prop({ required: false, default: 0 })
  productHeight: number;

  // Loại sản phẩm
  @ApiProperty()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: ProductType.name,
  })

  @IsMongoId()
  productType: Types.ObjectId

  @ApiProperty()
  @Prop({ required: true, unique: true })
  @IsString()
  code: string;
  
  // Tên sản phẩm
  @ApiProperty()
  @Prop({ required: true })
  @IsString()
  name: string;

  @ApiProperty()
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Customer.name,
  })
  @IsMongoId()
  customer: Types.ObjectId;

  @ApiProperty()
  @Prop({ default: "" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @Prop({ type: String, default: null })
  @IsOptional()
  @IsString()
  image?: string | null;

  @ApiProperty()
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Ware.name }],
    required: true,
  })
  @IsArray()
  @IsMongoId({ each: true })
  wares: Types.ObjectId[];

  @ApiProperty()
  @Prop({ default: "" })
  @IsOptional()
  @IsString()
  note?: string;
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema =
  SchemaFactory.createForClass(Product).plugin(softDeletePlugin);
