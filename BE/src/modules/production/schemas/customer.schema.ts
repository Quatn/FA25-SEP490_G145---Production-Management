import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsOptional, IsString } from "class-validator";
import { HydratedDocument } from "mongoose";

@Schema({ timestamps: true })
export class Customer extends BaseSchema {
  @Prop({ required: true, unique: true })
  @IsString()
  code: string;

  @Prop({ required: true })
  @IsString()
  name: string;

  @Prop({ required: true })
  @IsOptional()
  @IsString()
  address: string | null;

  @Prop({ required: true })
  @IsOptional()
  @IsString()
  email: string | null;

  @Prop({ required: true })
  @IsOptional()
  @IsString()
  contactNumber: string | null;

  @Prop({ required: true })
  @IsOptional()
  @IsString()
  note: string = "";
}

export type CustomerDocument = HydratedDocument<Customer>;

export const CustomerSchema = SchemaFactory.createForClass(
  Customer,
).plugin(
  softDeletePlugin,
);
