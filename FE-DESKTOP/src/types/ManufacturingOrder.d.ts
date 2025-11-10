import { PurchaseOrder } from "./PurchaseOrder";

export interface ManufacturingOrder extends BaseSchema {
  code: string;
  manufacturingDate: Date;
  requestedDatetime: Date;
  corrugatorLine: number;
  manufacturedAmount: number;
  manufacturingDirective: string | null;
  note: string;

  purchaseOrderItem?: PurchaseOrder;
}
