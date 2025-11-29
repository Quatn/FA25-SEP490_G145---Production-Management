import { CorrugatorLine } from "@/types/enums/CorrugatorLine";

export class CreateManufacturingOrderRequestDto {
  purchaseOrderItemId: string;
  manufacturingDateAdjustment: Date | null;
  requestedDatetime: Date | null;
  corrugatorLineAdjustment: CorrugatorLine | null;
  manufacturingDirective: string | null;
  amount: number;
  note: string;
}
