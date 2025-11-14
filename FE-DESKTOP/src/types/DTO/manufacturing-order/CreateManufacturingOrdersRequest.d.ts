export class CreateManufacturingOrderRequestDto {
  purchaseOrderItemId: string;
  manufacturingDateAdjustment: Date | null;
  requestedDatetime: Date | null;
  corrugatorLineAdjustment: number | null;
  manufacturingDirective: string | null;
  note: string;
}
