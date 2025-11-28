import { LEGACY_ProcessStatus } from "./enums/LEGACY_ProcessStatus";

/** @deprecated Use OrderFinishingProcess if possible, that's what this is supposed to be */
export interface ManufacturingOrderProcess extends BaseSchema {
  manufacturingOrder: string;
  processDefinition: string | WareFinishingProcessType;
  processNumber: number;
  status: LEGACY_ProcessStatus;
  manufacturedAmount: number;
  note: string;
}

