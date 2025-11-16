import { PurchaseOrderItem } from "./PurchaseOrderItem";

export interface ManufacturingOrder extends BaseSchema {
  code: string;
  manufacturingDate: Date;
  manufacturingDateAdjustment: Date | null;
  requestedDatetime: Date;
  corrugatorLine: number;
  corrugatorLineAdjustment: number | null;
  amount: number;
  manufacturingDirective: string | null;
  note: string;

  purchaseOrderItem?: PurchaseOrderItem;
}
