import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import mockManufacturingOrders from "./mock-manufacturing-orders.json";
import mockPurchaseOrderItems from "./mock-purchase-order-items.json";
import mockSubPurchaseOrder from "./mock-sub-purchase-orders.json";
import mockPurchaseOrder from "./mock-purchase-orders.json";
import mockWares from "./mock-ware-catalog.json";
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem";
import { SubPurchaseOrder } from "@/types/SubPurchaseOrder";
import { PurchaseOrder } from "@/types/PurchaseOrder";
import { Ware } from "@/types/Ware";

export interface MockDatabase {
  manufacturingOrders: Serialized<ManufacturingOrder>[];
  purchaseOrderItems: Serialized<PurchaseOrderItem & { recalcFlag: boolean }>[];
  subPurchaseOrder: Serialized<SubPurchaseOrder>[];
  purchaseOrder: Serialized<PurchaseOrder>[];
  wares: Serialized<Ware & { recalcFlag: boolean }>[];
}

const initialData: MockDatabase = {
  manufacturingOrders: mockManufacturingOrders,
  purchaseOrderItems: mockPurchaseOrderItems,
  subPurchaseOrder: mockSubPurchaseOrder,
  purchaseOrder: mockPurchaseOrder,
  wares: mockWares,
};

let db: MockDatabase = structuredClone(initialData);

export function getDb(): MockDatabase {
  return db;
}

export function resetDb(): void {
  db = structuredClone(initialData);
}
