import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { BaseSchema } from "@/common/schemas/base.schema";
import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { ManufacturingProcess } from "./manufacturing-process.schema";

export enum WareUsageType {
  Lot = "Lót",
  Vach = "Vách",
  De = "Đế",
  Thung = "Thùng",
}

export enum WareManufacturingProcessType {
  Lien = "Liền",
  Tam = "Tấm",
  Ghep = "Ghép",
}


@Schema({ timestamps: true })
export class Ware extends BaseSchema {
  @Prop({ required: true, unique: true })
  code: string; // Ví dụ: "dt-pad-65x50"

  @Prop({ required: true, default: 0 })
  unitPrice: number;

  @Prop({ required: false })
  fluteCombinationCode: string; // Ví dụ: "5BC"

  @Prop({ required: true, enum: WareUsageType })
  wareUsageType: WareUsageType;

  @Prop({ required: true })
  wareWidth: number; // Kích thước

  @Prop({ required: true })
  wareLength: number; // Kích thước

  @Prop({ required: false })
  wareHeight: number; // Kích thước (nếu có)

  @Prop({ required: true, enum: WareManufacturingProcessType })
  wareManufacturingProcessType: WareManufacturingProcessType;

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

  @Prop({ required: false, default: [] })
  printColors: string[];

  @Prop({ required: true, default: 900 }) //Khổ giấy
  paperWidth: number;

  @Prop({ required: true, default: 0 }) //Khổ gia công
  blankWidth: number;

  @Prop({ required: true, default: 0 }) //Cắt dài gia công
  blankLength: number;

  @Prop({ required: true, default: 900 }) //Nắp/ Cánh SP
  flapLength: number;

  @Prop({ required: true, default: 900 }) //Lề biên
  margin: number;

  @Prop({ required: true, default: 1 }) //Part SX
  crossCutCount: number;

  @Prop({ required: true, default: "" }) //Giấy mặt SP // sẽ là ref sau này
  faceLayerPaperType: string;

  @Prop({ required: true, default: "" }) //Giấy sóng E
  EFlutePaperType: string;

  @Prop({ required: true, default: "" }) //Giấy lớp giữa sóng E và sóng B
  EBLinerLayerPaperType: string;

  @Prop({ required: true, default: "" }) //Giấy sóng B
  BFlutePaperType: string;

  @Prop({ required: true, default: "" }) //Giấy lớp giữa sóng B và sóng A/C
  BACLinerLayerPaperType: string;

  @Prop({ required: true, default: "" }) //Giấy sóng A/C
  ACFlutePaperType: string;

  @Prop({ required: true, default: "" }) //Giấy đáy SP
  backLayerPaperType: string;

  @Prop({ required: false, default: "" })
  note: string;

  @Prop({ required: false, default: true })
  recalcFlag: boolean;
}

export type WareDocument = HydratedDocument<Ware>;

export const WareSchema =
  SchemaFactory.createForClass(Ware).plugin(softDeletePlugin);
