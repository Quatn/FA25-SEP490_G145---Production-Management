import { CorrugatorProcess } from "./CorrugatorProcess";
import { CorrugatorLine } from "./enums/CorrugatorLine";
import { LEGACY_OrderStatus } from "./enums/LEGACY_OrderStatus";
import { ManufacturingOrderApprovalStatus } from "./enums/ManufacturingOrderApprovalStatus";
import { ManufacturingOrderDirectives } from "./enums/ManufacturingOrderDirectives";
import { FinishedGood } from "./FinishedGood";
import { ManufacturingOrderProcess } from "./OrderFinishingProcess";
import { PurchaseOrderItem } from "./PurchaseOrderItem";

export interface ManufacturingOrder extends BaseSchema {
  code: string;
  approvalStatus: ManufacturingOrderApprovalStatus;
  manufacturingDate: Date;
  manufacturingDateAdjustment: Date | null;
  requestedDatetime: Date | null;
  corrugatorLine: CorrugatorLine;
  corrugatorLineAdjustment?: CorrugatorLine | null;
  amount: number;
  numberOfBlanks: number;
  longitudinalCutCount: number;
  runningLength: number;
  faceLayerPaperWeight: number | null;
  EFlutePaperWeight: number | null;
  EBLinerLayerPaperWeight: number | null;
  BFlutePaperWeight: number | null;
  BACLinerLayerPaperWeight: number | null;
  ACFlutePaperWeight: number | null;
  backLayerPaperWeight: number | null;
  totalVolume: number;
  totalWeight: number;
  manufacturingDirective?: ManufacturingOrderDirectives | null;
  note: string;

  purchaseOrderItem: string | PurchaseOrderItem;
  corrugatorProcess: CorrugatorProcess;

  finishedGoodRecord?: string | FinishedGood,

  // LEGACY CODE: KEPT DUE TO TIME LIMITATION, AVOID USING IF POSSIBLE
  /** @deprecated MO should not be referencing *order finishing processes*, which is what this array is trying to be */
  processes: string[] | ManufacturingOrderProcess[];

  /** @deprecated MO wont have *operative* status, it is supposed to derive that from other objects is it associated with */
  overallStatus: LEGACY_OrderStatus;
}
