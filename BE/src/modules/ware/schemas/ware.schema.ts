import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { BaseSchema } from "@/common/schemas/base.schema";
import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { ManufacturingProcess } from "@/modules/production/manufacturing-process/schemas/manufacturing-process.schema";

@Schema({ timestamps: true })
export class Ware extends BaseSchema {
  @Prop({ required: true, unique: true })
  code: string; // Ví dụ: "dt-pad-65x50"

  @Prop({ required: true, default: 0 })
  unitPrice: number;

  @Prop({ required: false })
  fluteCombinationCode: string; // Ví dụ: "5BC"

  @Prop({ required: true })
  wareWidth: number; // Kích thước

  @Prop({ required: true })
  wareLength: number; // Kích thước

  @Prop({ required: false })
  wareHeight: number; // Kích thước (nếu có)
  
  @Prop({ required: true })
  wareManufacturingProcessType: string; // Ví dụ: "Tấm", "Liền"

  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: ManufacturingProcess.name,
      },
    ],
    default: [],
  }) // Danh sách các công đoạn mà mã hàng này yêu cầu
  manufacturingProcesses: Types.ObjectId[];

  @Prop({ required: false })
  typeOfPrinter: string; // Ví dụ: "Máy 6 màu"

  @Prop({ required: false, default: "" })
  note: string;

  @Prop({ required: false, default: true })
  recalcFlag: boolean;

}

export type WareDocument = HydratedDocument<Ware>;

export const WareSchema =
  SchemaFactory.createForClass(Ware).plugin(softDeletePlugin);