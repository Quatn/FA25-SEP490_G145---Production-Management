export type ProcessingType = "Liền" | "Tấm" | "Ghép";
export type WareUsageType = "Lót" | "Vách" | "Đế" | "Thùng";
export type ProductType = "Lót" | "Vách" | "Đế" | "Thùng" | "Bộ";

export interface WareCode {
  id: number;
  wareCode: string;
  customerCode: string;
  fluteCombination: string;
  wareLength: number;
  wareWidth: number;
  wareHeight?: number;
  paperSize: number;
  processingType: ProcessingType;
  wareUsageType: WareUsageType;
}

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
  wareCodes: WareCode[];
  createdAt?: string;
  updatedAt?: string;
}
