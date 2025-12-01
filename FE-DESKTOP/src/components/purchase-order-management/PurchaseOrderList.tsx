// src/components/purchase-order-management/PurchaseOrderList.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { PurchaseOrder, SubPO, POItem } from "@/types/PurchaseOrderTypes";
import PurchaseOrderDetailModal from "./PurchaseOrderDetailModal";
import ProductSelectorModal from "./SubPOSelectorModal";
import {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderWithSubsQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
} from "@/service/api/purchaseOrderApiSlice";
import {
  useUpdatePurchaseOrderItemMutation,
  useDeletePurchaseOrderItemMutation,
} from "@/service/api/purchaseOrderItemApiSlice";
import {
  useCreateFromProductsMutation,
  useUpdateSubPurchaseOrderMutation,
  useDeleteSubPurchaseOrderMutation,
} from "@/service/api/subPurchaseOrderApiSlice";

function makeId(prefix = "") {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;
}

function normalizeServerPo(raw: any): PurchaseOrder {
  const id = raw._id?.$oid ?? raw._id ?? raw.id ?? String(Math.random());
  let customerId: string | undefined = undefined;
  let customerName = "";
  if (raw.customer) {
    if (typeof raw.customer === "string") {
      customerId = raw.customer;
      customerName = "";
    } else if (raw.customer._id || raw.customer.$oid) {
      customerId = raw.customer._id?.$oid ?? raw.customer._id ?? raw.customer;
      customerName = raw.customer.name ?? "";
    } else {
      customerId = raw.customer;
      customerName = "";
    }
  }

  return {
    id,
    poNumber: raw.code ?? "",
    poDate:
      raw.orderDate && typeof raw.orderDate === "string"
        ? raw.orderDate.slice(0, 10)
        : raw.orderDate
        ? new Date(raw.orderDate).toISOString().slice(0, 10)
        : "",
    customer: customerName || raw.customer?.name || "",
    customerId,
    address: raw.deliveryAddress ?? raw.deliveryAdress ?? "",
    phone: raw.customer?.contactNumber ?? raw.phone ?? "",
    email: raw.customer?.email ?? raw.email ?? "",
    taxTemplate: (raw as any).paymentTerms ?? "",
    poType: (raw as any).poType ?? "",
    style: (raw as any).style ?? "",
    styleDetails: (raw as any).styleDetails ?? "",
    status: raw.status ?? "",
    subPOs: raw.subPOs ?? [],
    totalItems: (raw as any).totalItems ?? 0,
    totalValue: (raw as any).totalValue ?? 0,
    notes: raw.note ?? raw.notes ?? "",
    createdBy: (raw as any).createdBy ?? "",
  } as any;
}

const SearchInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
}> = ({ value, onChange }) => (
  <input
    className="form-control"
    placeholder="Search PO number or customer"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />
);

const PO_STATUS_OPTIONS = [
  "DRAFT",
  "PENDINGAPPROVAL",
  "APPROVED",
  "SCHEDULED",
  "CANCELLED",
  "INPRODUCTION",
  "PAUSED",
  "PARTIALLYCOMPLETED",
  "COMPLETED",
  "PARTIALLYFINISHED",
  "FINISHED",
  "CLOSED",
];

const SUBPO_STATUS_OPTIONS = [
  "PENDINGAPPROVAL",
  "APPROVED",
  "SCHEDULED",
  "CANCELLED",
  "INPRODUCTION",
  "PAUSED",
  "PARTIALLYCOMPLETED",
  "COMPLETED",
  "INDELIVERY",
  "DELIVERED",
];

const POITEM_STATUS_OPTIONS = [
  "PENDINGAPPROVAL",
  "APPROVED",
  "SCHEDULED",
  "ONHOLD",
  "CANCELLED",
  "INPRODUCTION",
  "PAUSED",
  "FINISHEDPRODUCTION",
  "QUALITYCHECK",
  "COMPLETED",
];

// Considered "done" for an item
const DONE_ITEM_STATUSES = ["COMPLETED", "FINISHEDPRODUCTION"];

const PurchaseOrderList: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [selected, setSelected] = useState<PurchaseOrder | null>(null);

  const [productModalOpenForPo, setProductModalOpenForPo] = useState<{
    open: boolean;
    poId?: string;
  }>({
    open: false,
  });

  // get paginated purchase orders
  const {
    data: poResp,
    isLoading,
    refetch,
  } = useGetPurchaseOrdersQuery({
    page: 1,
    limit: 200,
    search: "",
  });

  const [createPo] = useCreatePurchaseOrderMutation();
  const [updatePo] = useUpdatePurchaseOrderMutation();
  const [deletePo] = useDeletePurchaseOrderMutation();
  const [createSubFromProducts] = useCreateFromProductsMutation();

  const [updateSub] = useUpdateSubPurchaseOrderMutation();
  const [deleteSub] = useDeleteSubPurchaseOrderMutation();

  const [updatePoItem] = useUpdatePurchaseOrderItemMutation();
  const [deletePoItem] = useDeletePurchaseOrderItemMutation();

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [expandedLocalDoc, setExpandedLocalDoc] = useState<any | null>(null);

  // expanded PO id to show server-side sub-POs; fetch details only when expanded
  const [expandedPoId, setExpandedPoId] = useState<string | null>(null);
  const {
    data: expandedPoResp,
    isFetching: isFetchingSubs,
    refetch: refetchSubs,
  } = useGetPurchaseOrderWithSubsQuery(expandedPoId ?? "", {
    skip: !expandedPoId,
  });

  useEffect(() => {
    const payload = poResp?.data?.data ?? poResp?.data ?? [];
    if (Array.isArray(payload)) {
      setOrders(payload.map(normalizeServerPo));
    } else {
      setOrders([]);
    }
  }, [poResp]);

  useEffect(() => {
    if (!expandedPoResp) {
      setExpandedLocalDoc(null);
      return;
    }
    const doc = expandedPoResp?.data ?? expandedPoResp ?? null;
    setExpandedLocalDoc(doc ? JSON.parse(JSON.stringify(doc)) : null);
  }, [expandedPoResp]);

  // stable id resolver (returns string if possible, else empty string)
  const resolveId = (x: any) => {
    if (x == null) return "";
    const candidate = x?._id?.$oid ?? x?._id ?? x?.id ?? null;
    if (candidate !== null && candidate !== undefined) return String(candidate);
    if (
      typeof x === "string" ||
      typeof x === "number" ||
      typeof x === "boolean"
    )
      return String(x);
    return "";
  };

  // helper: compute totals from expandedLocalDoc and push them into orders list
  const syncTotalsToOrders = (localDoc: any | null) => {
    if (!localDoc) return;
    const poId = String(localDoc._id ?? localDoc._id?.$oid ?? "") || "";
    const totals = { items: 0, value: 0 };
    (localDoc.subPurchaseOrders || []).forEach((s: any) => {
      (s.items || []).forEach((it: any) => {
        totals.items += 1;
        const unit = Number(it.ware?.unitPrice ?? 0);
        const amt = Number(it.amount ?? 0);
        totals.value += unit * amt;
      });
    });

    setOrders((prev) =>
      prev.map((p) =>
        String(p.id) === String(poId)
          ? { ...p, totalItems: totals.items, totalValue: totals.value }
          : p
      )
    );
  };

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        (o.poNumber || "").toLowerCase().includes(q) ||
        (o.customer || "").toLowerCase().includes(q)
    );
  }, [orders, query]);

  const updatePOLocal = (
    poId: string,
    updater: (po: PurchaseOrder) => PurchaseOrder
  ) => {
    setOrders((prev) =>
      prev.map((p) =>
        p.id === poId ? updater(JSON.parse(JSON.stringify(p))) : p
      )
    );
  };

  const handleCreateNewPO = () => {
    const newPo: PurchaseOrder = {
      id: makeId("local-"),
      poNumber: "",
      poDate: new Date().toISOString().slice(0, 10),
      customer: "",
      customerId: undefined,
      address: "",
      phone: "",
      email: "",
      taxTemplate: "",
      poType: "",
      style: "",
      styleDetails: "",
      status: "DRAFT",
      subPOs: [],
      totalItems: 0,
      totalValue: 0,
      notes: "",
      createdBy: "",
    } as any;
    setSelected(newPo);
  };

  const handleSaveFromModal = async (updated: PurchaseOrder) => {
    try {
      const payload: any = {
        code: updated.poNumber,
        orderDate: updated.poDate,
        deliveryAddress: updated.address,
        paymentTerms: updated.taxTemplate,
        note: updated.notes,
      };
      if ((updated as any).customerId) {
        payload.customer = (updated as any).customerId;
      }
      if (!updated.id || String(updated.id).startsWith("local-")) {
        await createPo(payload).unwrap();
      } else {
        await updatePo({ id: updated.id, body: payload }).unwrap();
      }
      await refetch();
      setSelected(null);
    } catch (err: any) {
      console.error("Save PO failed", err);
      alert(
        "Save failed: " + (err?.data?.message || err?.message || "unknown")
      );
    }
  };

  const handleDeleteFromList = async (po: PurchaseOrder) => {
    if (!po?.id) return;
    if (!confirm("Delete this Purchase Order?")) return;
    try {
      await deletePo(po.id).unwrap();
      await refetch();
    } catch (err: any) {
      console.error("Delete failed", err);
      alert(
        "Delete failed: " + (err?.data?.message || err?.message || "unknown")
      );
    }
  };

  const toggleExpandSubs = (poId: string) => {
    setExpandedPoId((prev) => (prev === poId ? null : poId));
  };

  const handleAddSubPO = (poId: string) => {
    const newSub: SubPO = {
      id: makeId("sub-"),
      poId,
      title: "New sub-PO",
      status: "Open",
      items: [],
      productType: "Bộ",
      customerCode: "",
      size: "",
    };
    updatePOLocal(poId, (po) => {
      po.subPOs = po.subPOs || [];
      po.subPOs.push(newSub);
      return po;
    });
  };

  const computeTotals = (po: PurchaseOrder) => {
    let items = 0;
    let value = 0;
    (po.subPOs || []).forEach((s) => {
      (s.items || []).forEach((it) => {
        items += 1;
        const t =
          Number(
            it.total ??
              (it.unitPrice && it.quantity ? it.unitPrice * it.quantity : 0)
          ) || 0;
        value += t;
      });
    });
    return { items, value };
  };

  // server-expanded PO doc (if fetched)
  const expandedPoDoc: any | null =
    expandedPoResp?.data ?? expandedPoResp ?? null;

  // Handler: update server item amount
  const handleUpdateServerItemAmount = async (
    itemIdRaw: any,
    newAmount: number
  ) => {
    const idStr = String(resolveId(itemIdRaw));
    // Optimistically update expandedLocalDoc
    setExpandedLocalDoc((prev: any) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      let touched = false;
      (copy.subPurchaseOrders || []).forEach((s: any) => {
        (s.items || []).forEach((it: any) => {
          const itId = String(resolveId(it));
          if (itId === idStr) {
            it.amount = Number(newAmount ?? 0);
            touched = true;
          }
        });
      });
      if (touched) {
        // synchronize totals into the left-hand orders summary
        syncTotalsToOrders(copy);
        return copy;
      }
      return prev;
    });

    // send update to server (no full refetch)
    try {
      await updatePoItem({
        id: idStr,
        body: { amount: Number(newAmount ?? 0) },
      }).unwrap();
    } catch (err: any) {
      console.error("Update failed, refetching sub-POs", err);
      if (refetchSubs) await refetchSubs();
    }
  };

  // compute done count / total / anyInProduction for a sub-PO
  const computeSubWaresState = (sub: any) => {
    const items = sub.items || [];
    const total = items.length;
    let done = 0;
    let anyInProduction = false;
    for (const it of items) {
      const st = (it.status ?? "").toString();
      if (DONE_ITEM_STATUSES.includes(st)) done += 1;
      if (st === "INPRODUCTION") anyInProduction = true;
    }
    return { done, total, anyInProduction };
  };

  // compute PO-level product counts.
  // - productsWithProgress is used for status decisions (some progress or in production)
  // - productsCompleted is used to DISPLAY PO progress (completedProducts / totalProducts)
  const computePoProductsProgress = (subs: any[]) => {
    const totalProducts = (subs || []).length;
    let productsWithProgress = 0;
    let productsCompleted = 0;
    let anyProductInProduction = false;
    for (const s of subs || []) {
      const { done, total, anyInProduction } = computeSubWaresState(s);
      const hasProgress = total > 0 && (done > 0 || anyInProduction);
      if (hasProgress) productsWithProgress += 1;
      if (anyInProduction) anyProductInProduction = true;
      if (total > 0 && done === total) productsCompleted += 1;
    }

    return {
      totalProducts,
      productsWithProgress,
      productsCompleted,
      anyProductInProduction,
    };
  };

  // Handler: update server item status
  const handleUpdateServerItemStatus = async (
    itemRaw: any,
    newStatus: string
  ) => {
    const idStr = String(resolveId(itemRaw));

    let affectedSubId: string | null = null;
    let computedSubStatus: string | null = null;
    let computedPoStatus: string | null = null;

    // Optimistic: update expandedLocalDoc
    setExpandedLocalDoc((prev: any) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      let touched = false;
      (copy.subPurchaseOrders || []).forEach((s: any) => {
        (s.items || []).forEach((it: any) => {
          if (String(resolveId(it)) === idStr) {
            it.status = newStatus;
            touched = true;
          }
        });
        if (touched && !affectedSubId) {
          affectedSubId = resolveId(s);
        }
      });
      if (touched) {
        if (affectedSubId) {
          const sub = (copy.subPurchaseOrders || []).find(
            (x: any) => resolveId(x) === affectedSubId
          );
          if (sub) {
            const { done, total, anyInProduction } = computeSubWaresState(sub);
            if (anyInProduction) {
              computedSubStatus = "INPRODUCTION";
              sub.status = computedSubStatus;
            } else if (total > 0 && done === total) {
              computedSubStatus = "COMPLETED";
              sub.status = computedSubStatus;
            } else if (done > 0) {
              computedSubStatus = "PARTIALLYCOMPLETED";
              sub.status = computedSubStatus;
            }
          }
        }

        syncTotalsToOrders(copy);

        const poSubs = copy.subPurchaseOrders || [];
        const {
          totalProducts,
          productsWithProgress,
          productsCompleted,
          anyProductInProduction,
        } = computePoProductsProgress(poSubs);

        if (anyProductInProduction) {
          computedPoStatus = "INPRODUCTION";
        } else if (totalProducts > 0 && productsCompleted === totalProducts) {
          computedPoStatus = "COMPLETED";
        } else if (productsWithProgress > 0) {
          computedPoStatus = "PARTIALLYCOMPLETED";
        } else {
          computedPoStatus = null;
        }

        if (computedPoStatus) {
          copy.status = computedPoStatus;
        }

        return copy;
      }
      return prev;
    });

    // Persist item status to server
    try {
      await updatePoItem({ id: idStr, body: { status: newStatus } }).unwrap();

      if (computedSubStatus && affectedSubId) {
        try {
          await updateSub({
            id: affectedSubId,
            body: { status: computedSubStatus },
          }).unwrap();
        } catch (err: any) {
          console.error("Persisting sub-PO status failed, refetching", err);
          if (refetchSubs) await refetchSubs();
        }
      }

      if (computedPoStatus && expandedLocalDoc) {
        try {
          const poId = String(
            expandedLocalDoc._id ?? expandedLocalDoc.id ?? expandedPoId ?? ""
          );
          if (poId) {
            // only update the PO status in the left-hand list (no full refetch)
            setOrders((prev) =>
              prev.map((p) =>
                String(p.id) === String(poId)
                  ? { ...p, status: computedPoStatus! }
                  : p
              )
            );
            await updatePo({
              id: poId,
              body: { status: computedPoStatus },
            }).unwrap();
          }
        } catch (err: any) {
          console.error("Persisting PO status failed, refetching", err);
          await refetch();
        }
      }
    } catch (err: any) {
      console.error("Update item status failed", err);
      if (refetchSubs) await refetchSubs();
      alert(
        "Update failed: " + (err?.data?.message || err?.message || "unknown")
      );
    }
  };

  // Handler: delete server item
  const handleDeleteServerItem = async (itemRaw: any) => {
    const idStr = String(resolveId(itemRaw));
    if (!confirm("Delete this item?")) return;

    const prevCopy = expandedLocalDoc
      ? JSON.parse(JSON.stringify(expandedLocalDoc))
      : null;

    setExpandedLocalDoc((prev: any) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      (copy.subPurchaseOrders || []).forEach((s: any) => {
        s.items = (s.items || []).filter(
          (it: any) => String(resolveId(it)) !== idStr
        );
      });
      syncTotalsToOrders(copy);
      return copy;
    });

    try {
      await deletePoItem(idStr).unwrap();
    } catch (err: any) {
      console.error("Delete failed, rolling back & refetching", err);
      if (prevCopy) setExpandedLocalDoc(prevCopy);
      if (refetchSubs) await refetchSubs();
      alert(
        "Delete failed: " + (err?.data?.message || err?.message || "unknown")
      );
    }
  };

  // Delete sub
  const handleDeleteServerSub = async (subRaw: any) => {
    const subId = String(resolveId(subRaw));
    if (!confirm("Xác nhận xóa sản phẩm này?")) return;

    const prevCopy = expandedLocalDoc
      ? JSON.parse(JSON.stringify(expandedLocalDoc))
      : null;

    setExpandedLocalDoc((prev: any) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      copy.subPurchaseOrders = (copy.subPurchaseOrders || []).filter(
        (s: any) => resolveId(s) !== subId
      );
      syncTotalsToOrders(copy);
      return copy;
    });

    try {
      await deleteSub(subId).unwrap();
    } catch (err: any) {
      console.error("Delete sub-PO failed, rolling back & refetching", err);
      if (prevCopy) setExpandedLocalDoc(prevCopy);
      if (refetchSubs) await refetchSubs();
      alert(
        "Xóa sản phẩm thất bại: " +
          (err?.data?.message || err?.message || "unknown")
      );
    }
  };

  const handleUpdatePoStatus = async (poId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((p) =>
        String(p.id) === String(poId) ? { ...p, status: newStatus } : p
      )
    );
    try {
      await updatePo({ id: poId, body: { status: newStatus } }).unwrap();
    } catch (err: any) {
      console.error("Update PO status failed", err);
      await refetch();
      alert(
        "Update PO status failed: " +
          (err?.data?.message || err?.message || "unknown")
      );
    }
  };

  const handleUpdateSubStatus = async (subIdRaw: any, newStatus: string) => {
    const subId = String(resolveId(subIdRaw));
    setExpandedLocalDoc((prev: any) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      (copy.subPurchaseOrders || []).forEach((s: any) => {
        if (resolveId(s) === subId) s.status = newStatus;
      });
      return copy;
    });

    try {
      await updateSub({ id: subId, body: { status: newStatus } }).unwrap();
    } catch (err: any) {
      console.error("Update sub-PO status failed", err);
      if (refetchSubs) await refetchSubs();
      alert(
        "Update failed: " + (err?.data?.message || err?.message || "unknown")
      );
    }
  };

  const handleUpdateSubDeliveryDate = async (
    subIdRaw: any,
    newDateStr: string
  ) => {
    const subId = String(resolveId(subIdRaw));
    setExpandedLocalDoc((prev: any) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      (copy.subPurchaseOrders || []).forEach((s: any) => {
        if (resolveId(s) === subId) s.deliveryDate = newDateStr || null;
      });
      return copy;
    });

    try {
      await updateSub({
        id: subId,
        body: { deliveryDate: newDateStr },
      }).unwrap();
    } catch (err: any) {
      console.error("Update sub-PO delivery failed", err);
      if (refetchSubs) await refetchSubs();
      alert(
        "Update failed: " + (err?.data?.message || err?.message || "unknown")
      );
    }
  };

  return (
    <div style={{ padding: 16 }}>
      {/* Inline styles for smooth progress animation are applied directly to progress-bar elements */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <button className="btn btn-outline-primary" onClick={handleCreateNewPO}>
          Tạo PO
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={() => alert("Nhập Excel - not implemented")}
        >
          Nhập Excel
        </button>

        <div style={{ flex: 1 }} />

        <div style={{ width: 360 }}>
          <SearchInput value={query} onChange={setQuery} />
        </div>
      </div>

      <div>
        {isLoading ? (
          <div className="text-muted">Loading purchase orders...</div>
        ) : filtered.length === 0 ? (
          <div className="text-muted">No purchase orders found</div>
        ) : (
          filtered.map((po) => {
            const isExpanded = expandedPoId === po.id;

            // If we have expandedLocalDoc for this PO, prefer it as the authoritative sub list
            const expandedDocMatchesPo =
              expandedLocalDoc &&
              String(resolveId(expandedLocalDoc)) === String(po.id);

            const serverSubs =
              (expandedDocMatchesPo || isExpanded) && expandedLocalDoc
                ? expandedLocalDoc.subPurchaseOrders ?? []
                : [];

            // If no expandedLocalDoc for this Po, fall back to the static snapshot on `po`
            const usedSubs = expandedDocMatchesPo
              ? expandedLocalDoc.subPurchaseOrders || []
              : isExpanded
              ? serverSubs
              : po.subPOs || [];

            // Compute PO progress: display uses completedProducts/totalProducts (so partial product doesn't count)
            const { totalProducts, productsWithProgress, productsCompleted } =
              computePoProductsProgress(usedSubs);

            const poPercent =
              totalProducts === 0
                ? 0
                : Math.round((productsCompleted / totalProducts) * 100);

            const totals = computeTotals(po);

            return (
              <div key={String(po.id)} className="card mb-3">
                <div className="card-body">
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          flexWrap: "wrap",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <strong>{po.poNumber}</strong>
                          <span className="text-muted"> ({po.status})</span>
                          <small className="text-muted"> • {po.poDate}</small>
                          <div className="small text-muted">{po.customer}</div>
                          <div className="small text-muted">{po.address}</div>
                        </div>

                        {/* PO-level progress bar */}
                        <div
                          style={{
                            marginLeft: 12,
                            minWidth: 200,
                            maxWidth: 280,
                          }}
                        >
                          <div
                            className="d-flex align-items-center"
                            title={`${productsCompleted}/${totalProducts}`}
                          >
                            <div style={{ flex: 1, marginRight: 8 }}>
                              <div className="progress" style={{ height: 18 }}>
                                <div
                                  className="progress-bar"
                                  role="progressbar"
                                  style={{
                                    width: `${poPercent}%`,
                                    transition: "width 320ms ease",
                                  }}
                                  aria-valuenow={poPercent}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                >
                                  <small
                                    style={{ color: "white" }}
                                  >{`${productsCompleted}/${totalProducts}`}</small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ marginBottom: 8 }}>
                        <select
                          className="form-select form-select-sm"
                          value={po.status ?? ""}
                          onChange={(e) =>
                            handleUpdatePoStatus(po.id, e.target.value)
                          }
                        >
                          <option value="">-- Status --</option>
                          {PO_STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                          display: "flex",
                          gap: 8,
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => setSelected(po)}
                        >
                          Xem chi tiết
                        </button>
                        <button
                          className="btn btn-outline-info btn-sm"
                          onClick={() => toggleExpandSubs(po.id)}
                        >
                          {isExpanded ? "Hiện sản phẩm" : "Ẩn sản phẩm"}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteFromList(po)}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <h6 className="m-0">Sản phẩm</h6>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn btn-outline-success btn-sm"
                          onClick={() =>
                            setProductModalOpenForPo({
                              open: true,
                              poId: po.id,
                            })
                          }
                        >
                          + Tạo Sub-PO (Chọn sản phẩm)
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ marginBottom: 12 }}>
                        {isFetchingSubs ? (
                          <div className="text-muted">Loading sản phẩm...</div>
                        ) : serverSubs.length === 0 ? (
                          <div className="text-muted">Không có sản phẩm</div>
                        ) : (
                          serverSubs.map((s: any, sIdx: number) => {
                            const subKey =
                              resolveId(s) ||
                              `sub-noid-${String(po.id)}-${sIdx}`;
                            const { done, total } = computeSubWaresState(s);
                            const percent =
                              total === 0
                                ? 0
                                : Math.round((done / total) * 100);
                            return (
                              <div key={subKey} className="card mb-2">
                                <div className="card-body">
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      gap: 8,
                                    }}
                                  >
                                    <div>
                                      <strong>
                                        {s.product?.name ??
                                          s.product?.code ??
                                          "-"}
                                      </strong>
                                      <div className="small text-muted">
                                        Vận chuyển:{" "}
                                        {s.deliveryDate
                                          ? new Date(s.deliveryDate)
                                              .toISOString()
                                              .slice(0, 10)
                                          : "-"}
                                      </div>
                                    </div>

                                    {/* product-level progress */}
                                    <div
                                      style={{ width: 220, marginRight: 12 }}
                                    >
                                      <div
                                        className="d-flex align-items-center"
                                        title={`${done}/${total}`}
                                      >
                                        <div
                                          style={{ flex: 1, marginRight: 8 }}
                                        >
                                          <div
                                            className="progress"
                                            style={{ height: 14 }}
                                          >
                                            <div
                                              className="progress-bar"
                                              role="progressbar"
                                              style={{
                                                width: `${percent}%`,
                                                transition: "width 320ms ease",
                                              }}
                                              aria-valuenow={percent}
                                              aria-valuemin={0}
                                              aria-valuemax={100}
                                            >
                                              <small
                                                style={{
                                                  color: "white",
                                                  fontSize: 12,
                                                }}
                                              >{`${done}/${total}`}</small>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div style={{ textAlign: "right" }}>
                                      <div style={{ marginBottom: 6 }}>
                                        <select
                                          className="form-select form-select-sm"
                                          value={s.status ?? ""}
                                          onChange={(e) =>
                                            handleUpdateSubStatus(
                                              s._id ?? s.id,
                                              e.target.value
                                            )
                                          }
                                        >
                                          <option value="">-- Status --</option>
                                          {SUBPO_STATUS_OPTIONS.map((st) => (
                                            <option key={st} value={st}>
                                              {st}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      <div
                                        style={{
                                          display: "flex",
                                          gap: 8,
                                          justifyContent: "flex-end",
                                          alignItems: "center",
                                        }}
                                      >
                                        <input
                                          type="date"
                                          className="form-control form-control-sm"
                                          style={{ width: 160 }}
                                          value={
                                            s.deliveryDate
                                              ? typeof s.deliveryDate ===
                                                "string"
                                                ? s.deliveryDate.slice(0, 10)
                                                : new Date(s.deliveryDate)
                                                    .toISOString()
                                                    .slice(0, 10)
                                              : ""
                                          }
                                          onChange={(e) =>
                                            handleUpdateSubDeliveryDate(
                                              s._id ?? s.id,
                                              e.target.value
                                            )
                                          }
                                        />

                                        <button
                                          className="btn btn-danger btn-sm"
                                          onClick={() =>
                                            handleDeleteServerSub(s)
                                          }
                                        >
                                          Xóa sản phẩm
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* items for sub-PO */}
                                  <div style={{ marginTop: 8 }}>
                                    <table className="table table-sm table-bordered">
                                      <thead>
                                        <tr>
                                          <th>Mã sản phẩm</th>
                                          <th>Mã hàng</th>
                                          <th>Trạng thái</th>
                                          <th>Số lượng</th>
                                          <th>Đơn giá</th>
                                          <th style={{ textAlign: "right" }}>
                                            Thành tiền
                                          </th>
                                          <th style={{ width: 120 }}>
                                            Thao tác
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {(s.items || []).map(
                                          (it: any, idx: number) => {
                                            const itemId = resolveId(it);
                                            const stableKey = itemId
                                              ? String(itemId)
                                              : `noid-${
                                                  resolveId(s) || String(po.id)
                                                }-${idx}`;
                                            const amountVal = it.amount ?? 0;
                                            const unitPrice =
                                              it.ware?.unitPrice ?? 0;
                                            return (
                                              <tr key={stableKey}>
                                                <td>
                                                  {s.product?.code ??
                                                    it.id ??
                                                    ""}
                                                </td>

                                                <td>
                                                  {it.ware
                                                    ? it.ware.code ??
                                                      it.ware._id
                                                    : "-"}
                                                </td>

                                                <td>
                                                  <select
                                                    className="form-select form-select-sm"
                                                    value={it.status ?? ""}
                                                    onChange={(e) =>
                                                      handleUpdateServerItemStatus(
                                                        it,
                                                        e.target.value
                                                      )
                                                    }
                                                  >
                                                    <option value="">--</option>
                                                    {POITEM_STATUS_OPTIONS.map(
                                                      (opt) => (
                                                        <option
                                                          key={opt}
                                                          value={opt}
                                                        >
                                                          {opt}
                                                        </option>
                                                      )
                                                    )}
                                                  </select>
                                                </td>

                                                <td>
                                                  <input
                                                    className="form-control form-control-sm"
                                                    type="number"
                                                    value={Number(
                                                      it.amount ?? 0
                                                    )}
                                                    onChange={(e) => {
                                                      const v =
                                                        e.target.value === ""
                                                          ? 0
                                                          : Number(
                                                              e.target.value
                                                            );
                                                      setExpandedLocalDoc(
                                                        (prev: any) => {
                                                          if (!prev)
                                                            return prev;
                                                          const copy =
                                                            JSON.parse(
                                                              JSON.stringify(
                                                                prev
                                                              )
                                                            );
                                                          (
                                                            copy.subPurchaseOrders ||
                                                            []
                                                          ).forEach(
                                                            (s2: any) => {
                                                              (
                                                                s2.items || []
                                                              ).forEach(
                                                                (ii: any) => {
                                                                  if (
                                                                    String(
                                                                      resolveId(
                                                                        ii
                                                                      )
                                                                    ) ===
                                                                    String(
                                                                      resolveId(
                                                                        it
                                                                      )
                                                                    )
                                                                  ) {
                                                                    ii.amount =
                                                                      v;
                                                                  }
                                                                }
                                                              );
                                                            }
                                                          );
                                                          syncTotalsToOrders(
                                                            copy
                                                          );
                                                          return copy;
                                                        }
                                                      );
                                                    }}
                                                    onBlur={(e) => {
                                                      const finalVal = Number(
                                                        e.target.value || 0
                                                      );
                                                      handleUpdateServerItemAmount(
                                                        it,
                                                        finalVal
                                                      );
                                                    }}
                                                  />
                                                </td>

                                                <td
                                                  style={{ textAlign: "right" }}
                                                >
                                                  {unitPrice ?? "-"}
                                                </td>

                                                <td
                                                  style={{ textAlign: "right" }}
                                                >
                                                  {(
                                                    Number(it.amount ?? 0) *
                                                    Number(unitPrice ?? 0)
                                                  ).toLocaleString()}
                                                </td>

                                                <td>
                                                  <div
                                                    style={{
                                                      display: "flex",
                                                      gap: 6,
                                                    }}
                                                  >
                                                    <button
                                                      className="btn btn-danger btn-sm"
                                                      onClick={() =>
                                                        handleDeleteServerItem(
                                                          it
                                                        )
                                                      }
                                                    >
                                                      Xóa
                                                    </button>
                                                  </div>
                                                </td>
                                              </tr>
                                            );
                                          }
                                        )}
                                        {(s.items || []).length === 0 && (
                                          <tr>
                                            <td
                                              colSpan={7}
                                              className="text-muted"
                                            >
                                              Chưa có mã nào
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ProductSelectorModal
        show={productModalOpenForPo.open}
        onHide={() => setProductModalOpenForPo({ open: false })}
        onConfirm={async (selectedProducts) => {
          const poId = productModalOpenForPo.poId;
          if (!poId) {
            setProductModalOpenForPo({ open: false });
            return;
          }
          try {
            const payload = {
              purchaseOrderId: poId,
              products: selectedProducts.map((p: any) => ({
                productId: p.productId ?? p._id ?? p.unique_id,
                deliveryDate: p.deliveryDate,
                status: p.status,
              })),
            };
            await createSubFromProducts(payload).unwrap();
            if (refetchSubs) await refetchSubs();
            await refetch();
            setProductModalOpenForPo({ open: false });
          } catch (err: any) {
            console.error("Create sub-POs failed", err);
            alert(
              "Create sub-POs failed: " +
                (err?.data?.message || err?.message || "unknown")
            );
          }
        }}
      />

      <PurchaseOrderDetailModal
        po={selected}
        onClose={() => setSelected(null)}
        onSave={handleSaveFromModal}
        onOpenSubPOSelector={() => {}}
      />
    </div>
  );
};

export default PurchaseOrderList;
