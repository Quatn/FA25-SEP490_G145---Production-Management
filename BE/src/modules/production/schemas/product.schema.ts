import { softDeletePlugin } from "@/common/plugins/soft-delete.plugin";
import { BaseSchema } from "@/common/schemas/base.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Ware } from "@/modules/production/schemas/ware.schema";

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

  @Prop({ required: true })
  productLength: number;

  @Prop({ required: true })
  productWidth: number;

  @Prop({ required: false, default: 0 })
  productHeight: number;

  @Prop({ required: false, default: "" })
  description: string;

  //Loại sản phẩm
  @Prop({ required: true, enum: ProductType })
  productType: ProductType;

  @Prop({ required: false, default: "" })
  image: string;

  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: Ware.name,
      },
    ],
    default: [],
  })
  wareCodes: Types.ObjectId[];
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema =
  SchemaFactory.createForClass(Product).plugin(softDeletePlugin);

// Nếu cần đảm bảo wareCode unique toàn collection (không trùng giữa các Product),
// uncomment dòng dưới. Lưu ý: index này sẽ index mỗi element trong array wareCodes
// ProductSchema.index({ "wareCodes.wareCode": 1 }, { unique: true, sparse: true });
