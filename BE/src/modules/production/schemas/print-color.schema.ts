import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsOptional, IsString } from "class-validator";
import { HydratedDocument } from "mongoose";

@Schema({ timestamps: true })
export class PrintColor extends BaseSchema {
  @Prop({ required: true, unique: true })
  @IsString()
  code: string;

  @Prop({ required: true })
  @IsOptional()
  @IsString()
  description: string = "";

  @Prop({ required: true })
  @IsOptional()
  @IsString()
  note: string = "";
}

export type PrintColorDocument = HydratedDocument<PrintColor>;

export const PrintColorSchema = SchemaFactory.createForClass(
  PrintColor,
).plugin(
  softDeletePlugin,
);
