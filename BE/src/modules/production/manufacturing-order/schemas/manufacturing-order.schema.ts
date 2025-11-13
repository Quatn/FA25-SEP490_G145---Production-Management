import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { BaseSchema } from "@/common/schemas/base.schema";
import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { PurchaseOrderItem } from "@/modules/purchase-order-item/schemas/purchase-order-item.schema"; // import schema PO Item
import { ManufacturingOrderProcess } from "../../manufacturing-order-process/schemas/manufacturing-order-process.schema"; // Import schema MOP mới
import { CorrugatorProcess } from "@/modules/corrugator-process/schemas/corrugator-process.schema";

export enum OrderStatus {
  NOTSTARTED = "NOTSTARTED",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  OVERCOMPLETED = "OVERCOMPLETED",
  PAUSED = "PAUSED",
  CANCELLED = "CANCELLED",
}

@Schema({ timestamps: true })
export class ManufacturingOrder extends BaseSchema {
  @Prop({ required: true, unique: true })
  code: string;

  // Thay đổi từ `purchaseOrderItemCode: string`
  // Giờ đây chúng ta liên kết trực tiếp để populate
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: PurchaseOrderItem.name, // Giả sử tên schema của PO Item là 'PurchaseOrderItem'
  })
  purchaseOrderItem: PurchaseOrderItem;

  // Thêm trạng thái tổng thể cho MO
  @Prop({
    required: true,
    enum: OrderStatus,
    default: OrderStatus.NOTSTARTED,
  })
  overallStatus: OrderStatus;

  // Thêm liên kết tới các công đoạn con
  @Prop([
    {
      type: Types.ObjectId,
      ref: ManufacturingOrderProcess.name, // Ref tới schema MOP (sẽ tạo ở bước 3)
    },
  ])
  processes: ManufacturingOrderProcess[]; // Hoặc `Types.ObjectId[]`

  @Prop({
    required: true, // Quy trình sóng là bắt buộc
    type: Types.ObjectId,
    ref: CorrugatorProcess.name,
  })
  corrugatorProcess: CorrugatorProcess;

  @Prop({ required: true })
  manufacturingDate: Date;

  @Prop({ required: false })
  requestedDatetime: Date;

  @Prop({ required: true, type: Number })
  corrugatorLine: number;

  @Prop({ required: true })
  manufacturedAmount: number; // Đây có thể là tổng số lượng hoàn thành cuối cùng

  @Prop({ required: false })
  manufacturingDirective: string;

  @Prop({ required: false, default: "" })
  note: string;
}

export type ManufacturingOrderDocument = HydratedDocument<ManufacturingOrder>;

export const ManufacturingOrderSchema =
  SchemaFactory.createForClass(ManufacturingOrder).plugin(softDeletePlugin);
