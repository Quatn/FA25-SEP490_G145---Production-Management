// src/types/PurchaseOrderTypes.ts

export type UOM = "PCS" | "KG" | "M2" | string;

/**
 * Status enums as string unions to make reasoning explicit.
 * You can extend these later if you need more detailed workflow states.
 */
export type POStatus = "Draft" | "Waiting" | "Approved" | "InProgress" | "Done" | "Cancelled" | string;
export type SubPOStatus = "Open" | "Waiting" | "InProgress" | "Done" | "Cancelled" | string;
export type POItemStatus = "Pending" | "Produced" | "Shipped" | "Done" | "Cancelled" | string;

/**
 * A single PO item belongs to exactly one SubPO (subPOId).
 * It has its own status and basic cost/quantity fields.
 */
export interface POItem {
  id: string;
  subPOId: string; // foreign key -> SubPO.id
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
}

/**
 * A SubPO belongs to a PurchaseOrder (poId).
 * It contains a list of items (either ids or inline objects).
 * It also has its own status.
 */
export interface SubPO {
  id: string;
  poId: string; // foreign key -> PurchaseOrder.id
  title: string;
  status?: SubPOStatus;

  // items can be included inline for convenience
  // each item must have subPOId === this.id
  items: POItem[];

  // optional metadata
  assignedTo?: string;
  notes?: string;
}

/**
 * PurchaseOrder as top-level entity. It contains SubPOs (inline),
 * but subPOs also carry poId so relation is explicit both ways.
 */
export interface PurchaseOrder {
  id: string;
  poNumber: string; // ex: PO-XC-25-174
  poDate: string; // ISO yyyy-mm-dd
  customer: string;
  address?: string;
  phone?: string;
  email?: string;

  // extra fields you requested
  taxTemplate?: string; // Thuế
  poType?: string; // Loại PO
  style?: string; // Mã in (Market)
  styleDetails?: string; // Chi tiết mã in

  status?: POStatus;

  // explicit relation: subPOs are included inline here for convenience
  // each subPO must have poId === this.id
  subPOs?: SubPO[];

  // computed
  totalItems?: number;
  totalValue?: number;

  // optional metadata
  createdBy?: string;
  notes?: string;
}
