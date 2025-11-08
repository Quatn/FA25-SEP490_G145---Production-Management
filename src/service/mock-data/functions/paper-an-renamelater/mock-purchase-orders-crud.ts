// src/service/mock-data/functions/mock-purchase-orders-crud.ts
import raw from "../../mock-purchase-orders.json";

type AnyObj = Record<string, any>;

/* --- helper functions (same rules as before) --- */
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

/* --- main export: returns paginated wrapper with defaults --- */
export const mockPurchaseOrdersQuery = async ({
  page = 1,
  limit = 100,
}: {
  page?: number;
  limit?: number;
} = {}) => {
  // small artificial delay
  await new Promise((res) => setTimeout(res, 250));

  // deep clone raw data
  const dataAll: AnyObj[] = JSON.parse(JSON.stringify(raw || []));

  // compute derived values for each PO
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

  // clamp page
  const safePage = Math.max(1, Math.min(page, totalPages || 1));
  const start = (safePage - 1) * limit;
  const end = start + limit;
  const paged = dataAll.slice(start, end);

  return {
    data: paged, // array for this page
    totalItems,
    totalPages,
    page: safePage,
    limit,
    hasNextPage: safePage * limit < totalItems,
    hasPrevPage: safePage > 1,
  };
};
