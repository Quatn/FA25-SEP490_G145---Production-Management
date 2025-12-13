import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { PaperColor } from "./paper-color.schema";

@Schema({ timestamps: true })
export class PaperType extends BaseSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: PaperColor.name, required: true })
  paperColor: mongoose.Types.ObjectId | PaperColor;

  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  grammage: number;

}

export type PaperTypeDocument = HydratedDocument<PaperType>;

export const PaperTypeSchema = SchemaFactory.createForClass(PaperType).plugin(
  softDeletePlugin,
);
