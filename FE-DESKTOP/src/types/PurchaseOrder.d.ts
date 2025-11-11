import { Customer } from "./Customer";

export interface PurchaseOrder extends BaseSchema {
  code: string;
  orderDate: Date;
  deliveryAdress: string;
  paymentTerms: string;
  status: string;
  notes: string;

  customer?: Customer;
}
