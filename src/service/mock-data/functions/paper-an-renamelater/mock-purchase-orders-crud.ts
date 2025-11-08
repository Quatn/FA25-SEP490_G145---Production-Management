// src/service/mock-data/functions/paper-an-renamelater/mock-purchase-orders-crud.ts
import raw from "../../mock-purchase-orders.json";
import type { PurchaseOrder } from "@/types/PurchaseOrderTypes";

type AnyObj = Record<string, any>;

function deriveSubPOStatus(sub: AnyObj): string {
  const items = sub.items || [];
  if (!items.length) return sub.status || "Open";
  const allDone = items.every((it: AnyObj) => it.status === "Done");
  if (allDone) return "Done";
  const anyInProg = items.some((it: AnyObj) =>
    ["InProgress", "Produced", "Shipped"].includes(it.status)
  );
  if (anyInProg) return "InProgress";
  const anyPending = items.some((it: AnyObj) => it.status === "Pending");
  if (anyPending) return "Waiting";
  return sub.status || "Open";
}

function derivePOStatus(po: AnyObj): string {
  const subs = po.subPOs || [];
  if (!subs.length) return po.status || "Waiting";
  const allDone = subs.every((s: AnyObj) => s.status === "Done");
  if (allDone) return "Done";
  const anyInProg = subs.some((s: AnyObj) => s.status === "InProgress");
  if (anyInProg) return "InProgress";
  return "Waiting";
}

function computeTotals(po: AnyObj) {
  let itemsCount = 0;
  let totalValue = 0;
  (po.subPOs || []).forEach((s: AnyObj) => {
    (s.items || []).forEach((it: AnyObj) => {
      itemsCount += 1;
      const t = Number(it.total ?? (it.unitPrice && it.quantity ? it.unitPrice * it.quantity : 0)) || 0;
      totalValue += t;
    });
  });
  po.totalItems = itemsCount;
  po.totalValue = totalValue;
}

export const mockPurchaseOrdersQuery = async ({
  page = 1,
  limit = 100,
}: {
  page?: number;
  limit?: number;
} = {}): Promise<{
  data: { purchaseOrders: PurchaseOrder[] };
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}> => {
  await new Promise((res) => setTimeout(res, 250));

  // deep clone
  const dataAll: AnyObj[] = JSON.parse(JSON.stringify(raw || []));

  for (const po of dataAll) {
    po.subPOs = po.subPOs || [];
    for (const sub of po.subPOs) {
      sub.items = sub.items || [];
      for (const it of sub.items) {
        if (!it.subPOId) it.subPOId = sub.id;
      }
      sub.status = deriveSubPOStatus(sub);
    }
    computeTotals(po);
    po.status = derivePOStatus(po);
  }

  const totalItems = dataAll.length;
  const totalPages = limit > 0 ? Math.ceil(totalItems / limit) : 1;
  const safePage = Math.max(1, Math.min(page, totalPages || 1));
  const start = (safePage - 1) * limit;
  const end = start + limit;
  const paged = dataAll.slice(start, end) as PurchaseOrder[];

  return {
    data: { purchaseOrders: paged },
    totalItems,
    totalPages,
    page: safePage,
    limit,
    hasNextPage: safePage * limit < totalItems,
    hasPrevPage: safePage > 1,
  };
};
