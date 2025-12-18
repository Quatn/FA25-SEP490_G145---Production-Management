import { ManufacturingOrderOperativeStatus } from "@/types/enums/ManufacturingOrderOperativeStatus";

export class QueryAllMOStatusesByDateRangeRequestDto {
  startDate?: Date;
  endDate?: Date;
}

export class QueryAllMOStatusesByDateRangeResponseDto {
  _id: string;
  code: string;
  manufacturingDate: Date;
  manufacturingDateAdjustment: Date | null;
  operativeStatus: ManufacturingOrderOperativeStatus;
}
