import { FluteCombination } from "./FluteCombination";
import { PrintColor } from "./PrintColor";
import { WareFinishingProcessType } from "./WareFinishingProcessType";
import { WareManufacturingProcessType } from "./WareManufacturingProcessType";

export interface Ware extends BaseSchema {
  code: string;
  unitPrice: number;
  wareWidth: number;
  wareLength: number;
  wareHeight: number | null;
  warePerBlankAdjustment: number | null;
  flapAdjustment: number | null;
  flapOverlapAdjustment: number | null;
  crossCutCountAdjustment: number | null;
  warePerBlank: number;
  blankWidth: number;
  blankLength: number;
  flapLength: number | null;
  margin: number;
  paperWidth: number;
  crossCutCount: number;
  faceLayerPaperType: string | null;
  EFlutePaperType: string | null;
  EBLinerLayerPaperType: string | null;
  BFlutePaperType: string | null;
  BACLinerLayerPaperType: string | null;
  ACFlutePaperType: string | null;
  backLayerPaperType: string | null;
  volume: number;
  warePerSet: number;
  warePerCombinedSet: number;
  horizontalWareSplit: number;
  note: string;

  fluteCombination?: FluteCombination;
  wareManufacturingProcessType?: WareManufacturingProcessType;
  printColors?: PrintColor[];
  typeOfPrinter?: string | null;
  finishingProcesses: WareFinishingProcessType[];
}
