import { OrderFinishingProcessStatus } from "./enums/OrderFinishingProcessStatus";
import { ManufacturingOrder } from "./ManufacturingOrder";
import { WareFinishingProcessType } from "./WareFinishingProcessType";

export interface OrderFinishingProcess extends BaseSchema {
  code: string;
  manufacturingOrder: string | ManufacturingOrder;
  wareFinishingProcessType: string | WareFinishingProcessType;
  sequenceNumber: number;
  requiredAmount: number;
  completedAmount: number;
  status: OrderFinishingProcessStatus;
  note: string;
}

export interface GetOrderFinishingProcessDto {
  startDate?: string;
  endDate?: string;
  status?: OrderFinishingProcessStatus;
  search?: string;
  page?: number;
  limit?: number;
}
