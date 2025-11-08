import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsOptional, IsString } from "class-validator";
import { HydratedDocument } from "mongoose";

@Schema({ timestamps: true })
export class WareManufacturingProcessType extends BaseSchema {
  @Prop({ required: true, unique: true })
  @IsString()
  code: string;

  @Prop({ required: true })
  @IsString()
  name: string;

  @Prop({ required: true })
  @IsOptional()
  @IsString()
  description: string = "";

  @Prop({ required: true })
  @IsOptional()
  @IsString()
  note: string = "";
}

export type WareManufacturingProcessTypeDocument = HydratedDocument<
  WareManufacturingProcessType
>;

export const WareManufacturingProcessTypeSchema = SchemaFactory.createForClass(
  WareManufacturingProcessType,
).plugin(
  softDeletePlugin,
);
