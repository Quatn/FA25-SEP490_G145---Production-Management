export interface DeliveryNote {
  _id?: string;
  id?: string;
  code: number;
  customer: string | { _id?: string; id?: string; name?: string; [key: string]: any };
  poitems: string[];
  status: "PENDINGAPPROVAL" | "APPROVED" | "EXPORTED" | "CANCELLED";
  date: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  [key: string]: any;
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

