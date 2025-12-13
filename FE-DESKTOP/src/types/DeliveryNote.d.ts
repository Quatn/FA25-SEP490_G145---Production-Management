import { PurchaseOrderItem } from "./PurchaseOrderItem";

export interface DeliveryNote {
  _id?: string;
  id?: string;
  code: number;
  customer: string | { _id?: string; id?: string; name?: string;[key: string]: any };
  poitems: string[];
  status: "PENDINGAPPROVAL" | "APPROVED" | "EXPORTED" | "CANCELLED";
  date: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  [key: string]: any;
}

export interface DeliveryNoteFinishedGoodResponse {
  _id: string;
  code: number;
  customer: Customer;
  poitems: DeliveryNoteItem[];
  status: "PENDINGAPPROVAL" | "APPROVED" | "EXPORTED" | "CANCELLED";
  createdAt?: string;
}

export interface DeliveryNoteItem {
  poitem: PurchaseOrderItem;
  deliveredAmount: number;
}

export interface CreateDeliveryNoteDto {
  code?: number;

  customer: string;

  poitems: string[];

  status?: "PENDINGAPPROVAL" | "APPROVED" | "EXPORTED" | "CANCELLED";

  date?: string;
}


export type DeliveryNoteResponse = {
  success: boolean;
  message?: string;
  data?: DeliveryNote | null;
};

export type DeliveryNoteListResponse = {
  success: boolean;
  message?: string;
  data?: DeliveryNote[] | null;
};

