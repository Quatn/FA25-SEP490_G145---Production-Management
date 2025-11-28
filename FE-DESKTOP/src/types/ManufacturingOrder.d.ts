import { CorrugatorProcess } from "./CorrugatorProcess";
import { CorrugatorLine } from "./enums/CorrugatorLine";
import { LEGACY_OrderStatus } from "./enums/LEGACY_OrderStatus";
import { ManufacturingOrderDirectives } from "./enums/ManufacturingOrderDirectives";
import { ManufacturingOrderProcess } from "./OrderFinishingProcess";
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
  corrugatorLine: CorrugatorLine;
  corrugatorLineAdjustment?: CorrugatorLine | null;
  amount: number;
  manufacturingDirective?: ManufacturingOrderDirectives | null;
  note: string;
  overallStatus: OrderStatus;

  purchaseOrderItem: string | PurchaseOrderItem;
  corrugatorProcess: CorrugatorProcess;

  // LEGACY CODE: KEPT DUE TO TIME LIMITATION, AVOID USING IF POSSIBLE
  /** @deprecated MO should not be referencing *order finishing processes*, which is what this array is trying to be */
  processes: string[] | ManufacturingOrderProcess[];

  /** @deprecated MO wont have status, it is supposed to be derived from other objects is it associated with */
  overallStatus: LEGACY_OrderStatus;
}
