export type ManufacturingOrderStatus =
  | "NOTSTARTED"
  | "RUNNING"
  | "COMPLETED"
  | "OVERCOMPLETED"
  | "PAUSED"
  | "CANCELLED";

export type ManufacturingOrderProcessStatus =
  | "NOTSTARTED"
  | "RUNNING"
  | "COMPLETED"
  | "OVERCOMPLETED"
  | "PAUSED"
  | "CANCELLED";

export type ManufacturingProcessDTO = {
  id: string;
  code: string;
  name: string;
  description?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ManufacturingOrderProcessDTO = {
  id: string;
  manufacturingOrder: string;
  processDefinition?: ManufacturingProcessDTO;
  processNumber: number;
  status: ManufacturingOrderProcessStatus;
  manufacturedAmount: number;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CorrugatorProcessStatus =
  | "NOTSTARTED"
  | "RUNNING"
  | "COMPLETED"
  | "OVERCOMPLETED"
  | "PAUSED"
  | "CANCELLED";

export type CorrugatorProcessDTO = {
  id: string;
  // reference back to manufacturing order id
  manufacturingOrder: string;
  manufacturedAmount: number;
  status: CorrugatorProcessStatus;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type FluteCombinationDTO = {
  id: string;
  code: string;
  description?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type WareDTO = {
  id: string;
  code: string;
  unitPrice?: number;
  fluteCombinationCode?: string;
  // fluteCombination can be either an ObjectId string or populated FluteCombination object
  fluteCombination?: string | FluteCombinationDTO;
  wareWidth?: number;
  wareLength?: number;
  wareHeight?: number;
  wareManufacturingProcessType?: string;
  manufacturingProcesses?: ManufacturingProcessDTO[];
  paperWidth?: number;
  blankWidth?: number;
  blankLength?: number;
  flapLength?: number;
  margin?: number;
  crossCutCount?: number;
  faceLayerPaperType?: string;
  EFlutePaperType?: string;
  BFlutePaperType?: string;
  CFlutePaperType?: string;
  BCFlutePaperType?: string;
  EBFlutePaperType?: string;
  printColors?: string[];
  typeOfPrinter?: string;
  note?: string;
  recalcFlag?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PurchaseOrderItemPopulatedDTO = {
  id: string;
  subPurchaseOrderId?: string;
  amount?: number;
  longitudinalCutCount?: number;
  runningLength?: number;
  ware?: WareDTO;
  numberOfBlanks?: number;
  totalVolume?: number;
  totalWeight?: number;
  status?: string;
  note?: string;
  recalcFlag?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ManufacturingOrderTrackingDTO = {
  id: string;
  code: string;
  purchaseOrderItem?: PurchaseOrderItemPopulatedDTO;
  overallStatus: ManufacturingOrderStatus;
  processes?: ManufacturingOrderProcessDTO[];
  // corrugatorProcess can be either an id or populated object depending on API
  corrugatorProcess?: string | CorrugatorProcessDTO;
  manufacturingDate?: string;
  requestedDatetime?: string;
  corrugatorLine?: number;
  manufacturedAmount?: number;
  manufacturingDirective?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
};

