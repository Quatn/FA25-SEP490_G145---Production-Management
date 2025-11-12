import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { BaseSchema } from "@/common/schemas/base.schema";
import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { ManufacturingProcess } from "../../manufacturing-process/schemas/manufacturing-process.schema"; // Import "từ điển" công đoạn

// Định nghĩa các trạng thái cho một công đoạn
export enum ProcessStatus {
  NOTSTARTED = "NOTSTARTED", // Chờ
  RUNNING = "RUNNING", // Chạy
  COMPLETED = "COMPLETED", // Hoàn thành
  OVERCOMPLETED = "OVERCOMPLETED", //Vượt mức
  PAUSED = "PAUSED", // Tạm dừng
  CANCELLED = "CANCELLED", // Hủy
}

@Schema({ timestamps: true })
export class ManufacturingOrderProcess extends BaseSchema {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: "ManufacturingOrder", // Liên kết tới MO cha (dùng string để tránh circular dependency)
  })
  manufacturingOrder: Types.ObjectId; // Hoặc Types.ObjectId

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: ManufacturingProcess.name, // Liên kết tới "từ điển" (ví dụ: "BE" -> "Bế")
  })
  processDefinition: Types.ObjectId; // Hoặc Types.ObjectId

  @Prop({ required: true })
  processNumber: number; // Thứ tự công đoạn (1, 2, 3...)

  @Prop({
    required: true,
    enum: ProcessStatus,
    default: ProcessStatus.NOTSTARTED,
  })
  status: ProcessStatus;

  @Prop({ required: true, default: 0 })
  manufacturedAmount: number; // Số lượng đã sản xuất

  @Prop({ required: false })
  note: string;
}

export type ManufacturingOrderProcessDocument =
  HydratedDocument<ManufacturingOrderProcess>;

export const ManufacturingOrderProcessSchema = SchemaFactory.createForClass(
  ManufacturingOrderProcess,
).plugin(softDeletePlugin);
