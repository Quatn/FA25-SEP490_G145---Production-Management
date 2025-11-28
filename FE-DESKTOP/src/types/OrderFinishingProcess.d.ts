import { OrderFinishingProcessStatus } from "./enums/OrderFinishingProcessStatus";

export interface OrderFinishingProcess extends BaseSchema {
  manufacturingOrder: string;
  processDefinition: string | WareFinishingProcessType;
  processNumber: number;
  status: OrderFinishingProcessStatus;
  manufacturedAmount: number;
  note: string;
}
