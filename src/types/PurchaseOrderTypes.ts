// src/types/PurchaseOrderTypes.ts

export type UOM = "PCS" | "KG" | "M2" | string;

export type POStatus =
  | "Draft"
  | "Waiting"
  | "Approved"
  | "InProgress"
  | "Done"
  | "Cancelled"
  | string;
export type SubPOStatus =
  | "Open"
  | "Waiting"
  | "InProgress"
  | "Done"
  | "Cancelled"
  | string;
export type POItemStatus =
  | "Pending"
  | "Produced"
  | "Shipped"
  | "Done"
  | "Cancelled"
  | string;

export interface POItem {
  id: string;
  subPOId: string; // FK -> SubPO.id
  sku: string;
  description?: string;
  uom?: UOM;
  unitPrice?: number;
  quantity: number;
  total?: number;

  // lifecycle
  status?: POItemStatus;

  // optional metadata
  notes?: string;

  // --- New fields ---
  waveType?: string; // Sóng
  grammage?: number; // Khổ giấy (grammage)
}

export interface SubPO {
  id: string;
  poId: string; // FK -> PurchaseOrder.id
  title: string;
  status?: SubPOStatus;

  items: POItem[];

  // optional metadata
  assignedTo?: string;
  notes?: string;

  // --- New fields for sub-PO ---
  productType?: string; // Loại
  customerCode?: string; // Khách
  size?: string; // "L×W×H" string
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  poDate: string; // ISO yyyy-mm-dd
  customer: string;
  address?: string;
  phone?: string;
  email?: string;

  taxTemplate?: string;
  poType?: string;
  style?: string;
  styleDetails?: string;

  status?: POStatus;

  subPOs?: SubPO[];

  totalItems?: number;
  totalValue?: number;

  createdBy?: string;
  notes?: string;
}
