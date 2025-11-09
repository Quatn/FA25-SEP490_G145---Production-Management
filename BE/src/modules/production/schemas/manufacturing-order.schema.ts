import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ timestamps: true })
export class ManufacturingOrder extends BaseSchema {
  @Prop({ required: true, unique: true })
  code: string;

  // TODO: change to ref
  @Prop({ required: true, unique: true })
  purchaseOrderItemCode: string;

  @Prop({ required: true })
  manufacturingDate: Date;

  @Prop({ required: false })
  requestedDatetime: Date;

  @Prop({ required: true })
  corrugatorLine: string;

  @Prop({ required: true })
  manufacturedAmount: number;

  // TODO: Change this to an enum, maybe
  @Prop({ required: false })
  manufacturingDirective: string;

  @Prop({ required: true })
  note: string = "";
}

export type ManufacturingOrderDocument = HydratedDocument<ManufacturingOrder>;

export const ManufacturingOrderSchema = SchemaFactory.createForClass(
  ManufacturingOrder,
).plugin(
  softDeletePlugin,
);
