import { PurchaseOrderItem } from "./PurchaseOrderItem";

export interface ManufacturingOrder extends BaseSchema {
  code: string;
  manufacturingDate: Date;
  requestedDatetime: Date;
  corrugatorLine: number;
  amount: number;
  manufacturingDirective: string | null;
  note: string;

  purchaseOrderItem?: PurchaseOrderItem;
}
