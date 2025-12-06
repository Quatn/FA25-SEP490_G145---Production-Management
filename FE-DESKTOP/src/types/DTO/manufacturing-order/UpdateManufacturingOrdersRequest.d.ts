import { CorrugatorLine } from "@/types/enums/CorrugatorLine";
import { ManufacturingOrderApprovalStatus } from "@/types/enums/ManufacturingOrderApprovalStatus";

export class UpdateManufacturingOrderRequestDto {
  id: string;
  purchaseOrderItemId: string;
  manufacturingDateAdjustment?: Date | null;
  requestedDatetime?: Date | null;
  corrugatorLineAdjustment?: CorrugatorLine | null;
  manufacturingDirective?: string | null;
  approvalStatus: ManufacturingOrderApprovalStatus | null;
  amount?: number;
  note?: string;
}
