import { Customer } from "./Customer";

export interface PurchaseOrder extends BaseSchema {
  _id?: string;
  code: string;
  orderDate: string; 
  deliveryAddress: string;
  paymentTerms: string;
  customer?: Customer; 
  status: string; 
  note?: string;
}



