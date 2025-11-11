import { Product } from "./Product";
import { PurchaseOrder } from "./PurchaseOrder";

export interface SubPurchaseOrder extends BaseSchema {
  code: string;
  deliveryDate: Date;
  status: string;
  note: string;

  purchaseOrder?: PurchaseOrder;
  product?: Product;
}
