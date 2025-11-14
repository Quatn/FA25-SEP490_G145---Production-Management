import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { BaseSchema } from "@/common/schemas/base.schema";

@Schema({ timestamps: true })
export class ManufacturingProcess extends BaseSchema {
  @Prop({ required: true, unique: true })
  code: string; // Ví dụ: "IN", "BE", "DAN"

  @Prop({ required: true })
  name: string; // Ví dụ: "In", "Bế", "Dán"

  @Prop({ required: false })
  description: string; // Mô tả công đoạn

  @Prop({ required: false })
  note: string; // Ghi chú thêm (ví dụ: "Dùng cho thùng bế...")
}

export type ManufacturingProcessDocument = HydratedDocument<ManufacturingProcess>;

export const ManufacturingProcessSchema = SchemaFactory.createForClass(
  ManufacturingProcess,
);