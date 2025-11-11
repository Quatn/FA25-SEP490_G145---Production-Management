import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { PaperSupplier } from "./paper-supplier.schema";
import { PaperType } from "./paper-type.schema";

@Schema({ timestamps: true })
export class PaperRoll extends BaseSchema {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: PaperSupplier.name, required: true })
  paperSupplierId: mongoose.Types.ObjectId | PaperSupplier;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: PaperType.name, required: true })
  paperTypeId: mongoose.Types.ObjectId | PaperType;

  @Prop({ required: true })
  sequenceNumber: number;

  @Prop({ required: true })
  weight: number;

  @Prop({ required: true })
  receivingDate: Date;

  @Prop({ required: true })
  note: string;

}

export type PaperRollDocument = HydratedDocument<PaperRoll>;

export const PaperRollSchema = SchemaFactory.createForClass(PaperRoll).plugin(
  softDeletePlugin,
);
