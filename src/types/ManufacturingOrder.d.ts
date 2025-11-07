export type ManufacturingOrder = {
  id: string;
  code: string;
  purchaseOrderItemId: string;
  manufacturingDate: Date;
  requestedDatetime: Date;
  corrugatorLine: number;
  manufacturedAmount: number;
  manufacturingDirective: string | null;
  note: string;
};
