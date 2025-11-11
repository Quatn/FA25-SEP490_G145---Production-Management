import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { HydratedDocument } from "mongoose";

@Schema({ timestamps: true })
export class WareFinishingProcessType extends BaseSchema {
  @ApiProperty()
  @Prop({ required: true, unique: true })
  @IsString()
  code: string;

  @ApiProperty()
  @Prop({ required: true })
  @IsString()
  name: string;

  @ApiProperty()
  @Prop({ required: false, default: "" })
  @IsOptional()
  @IsString()
  description: string = "";

  @ApiProperty()
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
