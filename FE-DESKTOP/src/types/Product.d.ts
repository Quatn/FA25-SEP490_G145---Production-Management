import { Customer } from "./Customer";
import { Ware } from "./Ware";
import { ProductType } from "./ProductType";
import { BaseSchema } from "@/common/schemas/base.schema"; 

export interface Product extends BaseSchema {
  productLength: number;
  productWidth: number;
  productHeight: number; 
  productType: ProductType;
  code: string;
  name: string;
  customer: Customer;
  description: string;
  image: string | null;
  wares: Ware[];
  note: string;
}