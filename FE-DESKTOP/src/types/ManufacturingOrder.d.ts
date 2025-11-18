import { PurchaseOrderItem } from "./PurchaseOrderItem";

export enum OrderStatus {
  NOTSTARTED = "NOTSTARTED",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  OVERCOMPLETED = "OVERCOMPLETED",
  PAUSED = "PAUSED",
  CANCELLED = "CANCELLED",
}

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
  overallStatus: OrderStatus;

  purchaseOrderItem?: PurchaseOrderItem;
}
