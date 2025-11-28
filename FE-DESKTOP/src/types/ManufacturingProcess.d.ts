/** @deprecated Use WareFinishingProcessType if possible, that's what this is supposed to be */
export interface ManufacturingProcess extends BaseSchema {
  code: string;
  name: string;
  description?: string;
  note?: string;
}

