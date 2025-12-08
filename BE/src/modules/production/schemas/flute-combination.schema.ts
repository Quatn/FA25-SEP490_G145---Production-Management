import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { HydratedDocument } from "mongoose";

@Schema({ timestamps: true })
export class FluteCombination extends BaseSchema {
  @ApiProperty()
  @Prop({ required: true, unique: true })
  @IsString()
  code: string;

  @ApiProperty()
  @Prop({ required: true})
  flutes: string[];

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

export type FluteCombinationDocument = HydratedDocument<FluteCombination>;

export const FluteCombinationSchema = SchemaFactory.createForClass(
  FluteCombination,
).plugin(
  softDeletePlugin,
);
