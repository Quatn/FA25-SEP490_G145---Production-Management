export type PurchaseOrder = {
  id: string;
  code: string;
  customerCode: string;
  orderDate: Date;
  deliveryAdress: string;
  paymentTerms: string;
  status: string;
  notes: string;
};
