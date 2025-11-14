import { FluteCombination } from "./FluteCombination";
import { PrintColor } from "./PrintColor";
import { WareFinishingProcessType } from "./WareFinishingProcessType";
import { WareManufacturingProcessType } from "./WareManufacturingProcessType";
import { ManufacturingProcess } from "./ManufacturingProcess";

export interface Ware extends BaseSchema {
  code: string;
  unitPrice: number;
  // fluteCombination can be ObjectId (string) when not populated, or FluteCombination object when populated
  fluteCombination: string | FluteCombination;
  wareWidth: number;
  wareLength: number;
  wareHeight: number | null;
  // wareManufacturingProcessType can be ObjectId (string) when not populated, or WareManufacturingProcessType object when populated
  wareManufacturingProcessType: string | WareManufacturingProcessType;
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
  printColors: string[] | PrintColor[];
  typeOfPrinter: string | null;
  finishingProcesses: string[] | WareFinishingProcessType[];
  manufacturingProcesses: string[] | ManufacturingProcess[];
  note: string;
  recalcFlag: boolean;
}

  
