import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { BaseSchema } from "@/common/schemas/base.schema";
import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { Ware } from "./ware.schema"; // Import Schema Ware

export enum ProcessStatus {
  NOTSTARTED = "NOTSTARTED", // Chờ
  RUNNING = "RUNNING", // Chạy
  COMPLETED = "COMPLETED", // Hoàn thành
  PAUSED = "PAUSED", // Tạm dừng
  CANCELLED = "CANCELLED", // Hủy
}

@Schema({ timestamps: true })
export class PurchaseOrderItem extends BaseSchema {
  @Prop({ required: true })
  subPurchaseOrderId: string; // Liên kết tới PO cha (nếu cần)

  @Prop({ required: true })
  amount: number; // Số lượng cần sản xuất

  @Prop({ required: true })
  longitudinalCutCount: number; // Tấm chặt

  @Prop({ required: true })
  runningLength: number; // Mét dài

  // LIÊN KẾT TỚI WARE (MÃ HÀNG)
  // Thay thế trường `wareCode: string` bằng ref
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: Ware.name, // Liên kết tới Model Ware
  })
  ware: Ware;

  @Prop({ required: true, default: 0 })
  numberOfBlanks: number;

  @Prop({ required: true, default: 0 })
  totalVolume: number;

  @Prop({ required: true, default: 0 })
  totalWeight: number;

  @Prop({ required: true, default: "NOTSTARTED", enum: ProcessStatus })
  status: ProcessStatus; // Trạng thái của PO Item

  @Prop({ required: false, default: "" })
  note: string;

  @Prop({ required: false, default: true })
  recalcFlag: boolean;
}

export type PurchaseOrderItemDocument = HydratedDocument<PurchaseOrderItem>;

export const PurchaseOrderItemSchema =
  SchemaFactory.createForClass(PurchaseOrderItem).plugin(softDeletePlugin);
