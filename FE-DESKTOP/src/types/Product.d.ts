export type ProductType = "Lót" | "Vách" | "Đế" | "Thùng" | "Bộ";
import { Ware } from "./Ware";

export interface Product {
  _id: string;
  id: string;
  customerCode: string;
  productName: string;
  description: string;
  productLength: number;
  productWidth: number;
  productHeight?: number;
  image?: string;
  productType: ProductType;
  wareCodes: Ware[] | string[]; // Can be populated Ware objects or ObjectId strings
  createdAt?: string;
  updatedAt?: string;
}
