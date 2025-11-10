import { SubPurchaseOrder } from "./SubPurchaseOrder";
import { Ware } from "./Ware";

export interface PurchaseOrderItem extends BaseSchema {
  code: string;
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
  status: string;
  note: string;

  subPurchaseOrder?: SubPurchaseOrder;
  ware?: Ware;
}
