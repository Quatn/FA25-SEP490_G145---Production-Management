import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export enum ProcessingType {
  Lien = "Liền",
  Tam = "Tấm",
  Ghep = "Ghép",
}

export enum WareUsageType {
  Lot = "Lót",
  Vach = "Vách",
  De = "Đế",
  Thung = "Thùng",
}

//Sẽ chuyển thành ref khi có Ware hiện tại đang MockData
@Schema({ _id: false })
export class Ware {
  //Sau khi ref có thể bỏ phần ID
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  wareCode: string;

  //Sau này có thể chuyển sang ref
  @Prop({ required: true })
  customerCode: string;

  //Sóng
  @Prop({ required: true })
  fluteCombination: string;

  //Rộng
  @Prop({ required: true })
  wareLength: number;

  //Dài
  @Prop({ required: true })
  wareWidth: number;

  //Cao
  @Prop({ required: false, default: 0 })
  wareHeight: number;

  //Khổ giấy
  @Prop({ required: true })
  paperSize: number;

  //Kiểu gia công: Liền, Tấm, Ghép
  @Prop({ required: true, enum: ProcessingType })
  processingType: ProcessingType;

  //Loại
  @Prop({ required: true, enum: WareUsageType })
  wareUsageType: WareUsageType;
}

const WareSchema = SchemaFactory.createForClass(Ware);

export enum ProductType {
  Lot = "Lót",
  Vach = "Vách",
  De = "Đế",
  Thung = "Thùng",
  Bo = "Bộ",
}

@Schema({ timestamps: true })
export class Product extends BaseSchema {
  //Product Code
  @Prop({ required: true })
  id: string;

  //Sẽ ref khi có Customer schema hiện tại sẽ là name customer
  @Prop({ required: true })
  customerCode: string;

  //Tên sản phẩm
  @Prop({ required: true })
  productName: string;

  @Prop({ required: false, default: "" })
  description: string;

  //Rộng
  @Prop({ required: true })
  productLength: number;

  //Dài
  @Prop({ required: true })
  productWidth: number;

  //Cao
  @Prop({ required: false, default: 0 })
  productHeight: number;

  //Loại sản phẩm
  @Prop({ required: true, enum: ProductType })
  productType: ProductType;

  @Prop({ required: false, default: "" })
  image: string;

  @Prop({ type: [WareSchema], default: [] })
  wareCodes: Ware[];
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema =
  SchemaFactory.createForClass(Product).plugin(softDeletePlugin);

// Nếu cần đảm bảo wareCode unique toàn collection (không trùng giữa các Product),
// uncomment dòng dưới. Lưu ý: index này sẽ index mỗi element trong array wareCodes
// ProductSchema.index({ "wareCodes.wareCode": 1 }, { unique: true, sparse: true });
