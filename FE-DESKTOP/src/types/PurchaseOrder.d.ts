import { Customer } from "./Customer";

export interface PurchaseOrder extends BaseSchema {
  code: string;
  orderDate: string;
  deliveryAddress: string;
  paymentTerms: string;
  customer?: Customer;
  status: string;
  note?: string;
}



