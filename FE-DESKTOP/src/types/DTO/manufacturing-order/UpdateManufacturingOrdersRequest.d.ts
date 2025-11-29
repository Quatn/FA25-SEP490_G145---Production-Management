import { CorrugatorLine } from "@/types/enums/CorrugatorLine";

export class UpdateManufacturingOrderRequestDto {
  id: string;
  purchaseOrderItemId: string;
  manufacturingDateAdjustment?: Date | null;
  requestedDatetime?: Date | null;
  corrugatorLineAdjustment?: CorrugatorLine | null;
  manufacturingDirective?: string | null;
  amount?: number;
  note?: string;
}
