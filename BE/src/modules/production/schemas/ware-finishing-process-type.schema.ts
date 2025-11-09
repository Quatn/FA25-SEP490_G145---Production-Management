import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsOptional, IsString } from "class-validator";
import { HydratedDocument } from "mongoose";

@Schema({ timestamps: true })
export class WareFinishingProcessType extends BaseSchema {
  @Prop({ required: true, unique: true })
  @IsString()
  code: string;

  @Prop({ required: true })
  @IsString()
  name: string;

  @Prop({ required: false, default: "" })
  @IsOptional()
  @IsString()
  description: string = "";

  @Prop({ required: false, default: "" })
  @IsOptional()
  @IsString()
  note: string = "";
}

export type WareFinishingProcessTypeDocument = HydratedDocument<
  WareFinishingProcessType
>;

export const WareFinishingProcessTypeSchema = SchemaFactory.createForClass(
  WareFinishingProcessType,
).plugin(
  softDeletePlugin,
);
