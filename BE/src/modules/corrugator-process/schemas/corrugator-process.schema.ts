import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { BaseSchema } from "@/common/schemas/base.schema";
import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { ManufacturingOrder } from "../../production/manufacturing-order/schemas/manufacturing-order.schema";

export enum CorrugatorProcessStatus {
  NOTSTARTED = "NOTSTARTED",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  OVERCOMPLETED = "OVERCOMPLETED",
  PAUSED = "PAUSED",
  CANCELLED = "CANCELLED",
}

@Schema({ timestamps: true })
export class CorrugatorProcess extends BaseSchema {
  // UniqueID (PK) - Mongoose tự tạo _id

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: "ManufacturingOrder",
  })
  manufacturingOrder: ManufacturingOrder;

  // Số lượng đã sản xuất
  @Prop({ required: true, default: 0 })
  manufacturedAmount: number;

  // Trạng thái (Tương tự MO)
  @Prop({
    required: true,
    enum: CorrugatorProcessStatus,
    default: CorrugatorProcessStatus.NOTSTARTED,
  })
  status: CorrugatorProcessStatus;

  // Ghi chú
  @Prop({ required: false, default: "" })
  note: string;
}

export type CorrugatorProcessDocument = HydratedDocument<CorrugatorProcess>;

export const CorrugatorProcessSchema =
  SchemaFactory.createForClass(CorrugatorProcess).plugin(softDeletePlugin);
