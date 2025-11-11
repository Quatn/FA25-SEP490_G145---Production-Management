import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ timestamps: true })
export class PaperSupplier extends BaseSchema {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  phone?: string;

  @Prop({ required: false })
  address?: string;

  @Prop({ required: false })
  email?: string;


  @Prop({ required: false })
  bank?: string;

  @Prop({ required: false })
  bankAccount?: string;

  @Prop({ required: false })
  note?: string;
}

export type PaperSupplierDocument = HydratedDocument<PaperSupplier>;

export const PaperSupplierSchema = SchemaFactory.createForClass(PaperSupplier).plugin(
  softDeletePlugin,
);
