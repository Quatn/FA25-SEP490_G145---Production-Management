import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Ware } from "./ware.schema";
import { Customer } from "./customer.schema";
import { IsArray, IsMongoId, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

@Schema({ timestamps: true })
export class Product extends BaseSchema {
  @ApiProperty()
  @Prop({ required: true, unique: true })
  @IsString()
  code: string;

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
  customer: mongoose.Types.ObjectId | Customer;

  @ApiProperty()
  @Prop({ required: false, default: "" })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty()
  @Prop({ required: false, type: String, default: null })
  @IsOptional()
  @IsString()
  image: string | null;

  @ApiProperty()
  @Prop({
    required: true,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Ware.name }],
  })
  @IsArray()
  wares: mongoose.Types.ObjectId[] | Ware[];

  @ApiProperty()
  @Prop({ required: false, default: "" })
  @IsOptional()
  @IsString()
  note: string = "";
}

export type ProductDocument = HydratedDocument<Product>;

export const ProductSchema = SchemaFactory.createForClass(
  Product,
).plugin(
  softDeletePlugin,
);
