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
import { useCreateFromProductsMutation } from "@/service/api/subPurchaseOrderApiSlice";
import { useUpdateSubPurchaseOrderMutation } from "@/service/api/subPurchaseOrderApiSlice";

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

// --- Status enums as arrays for selects (values match backend enums)
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

  // create/update/delete hooks
  const [createPo] = useCreatePurchaseOrderMutation();
  const [updatePo] = useUpdatePurchaseOrderMutation();
  const [deletePo] = useDeletePurchaseOrderMutation();
  const [createSubFromProducts] = useCreateFromProductsMutation();

  // subPO update mutation
  const [updateSub] = useUpdateSubPurchaseOrderMutation();

  // PO item update/delete hooks
  const [updatePoItem] = useUpdatePurchaseOrderItemMutation();
  const [deletePoItem] = useDeletePurchaseOrderItemMutation();

  // list local state
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);

  // better ui
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

  const resolveId = (x: any) => x?._id?.$oid ?? x?._id ?? x?.id ?? x;

  // helper: compute totals from expandedLocalDoc and push them into orders list
  const syncTotalsToOrders = (localDoc: any | null) => {
    if (!localDoc) return;
    const poId =
      String(localDoc._id ?? localDoc.id ?? localDoc._id?.$oid ?? "") || "";
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
      // attach customer ObjectId if present
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
      // deletePo expects a string id
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

  const handleRemoveSubPO = (poId: string, subId: string) => {
    if (!confirm("Remove this sub-PO?")) return;
    updatePOLocal(poId, (po) => {
      po.subPOs = (po.subPOs || []).filter((s) => s.id !== subId);
      return po;
    });
  };

  const handleChangeSubTitle = (poId: string, subId: string, value: string) => {
    updatePOLocal(poId, (po) => {
      (po.subPOs || []).forEach((s) => {
        if (s.id === subId) s.title = value;
      });
      return po;
    });
  };

  const handleChangeSubStatus = (
    poId: string,
    subId: string,
    value: string
  ) => {
    updatePOLocal(poId, (po) => {
      (po.subPOs || []).forEach((s) => {
        if (s.id === subId) s.status = value;
      });
      return po;
    });
  };

  const handleChangeSubProductType = (
    poId: string,
    subId: string,
    value: string
  ) => {
    updatePOLocal(poId, (po) => {
      (po.subPOs || []).forEach((s) => {
        if (s.id === subId) (s as any).productType = value;
      });
      return po;
    });
  };

  const handleChangeSubCustomerCode = (
    poId: string,
    subId: string,
    value: string
  ) => {
    updatePOLocal(poId, (po) => {
      (po.subPOs || []).forEach((s) => {
        if (s.id === subId) (s as any).customerCode = value;
      });
      return po;
    });
  };

  const handleChangeSubSize = (poId: string, subId: string, value: string) => {
    updatePOLocal(poId, (po) => {
      (po.subPOs || []).forEach((s) => {
        if (s.id === subId) (s as any).size = value;
      });
      return po;
    });
  };

  const handleAddItem = (poId: string, subId: string) => {
    const newItem: POItem = {
      id: makeId("item-"),
      subPOId: subId,
      sku: "",
      description: "",
      uom: "PCS",
      unitPrice: 0,
      quantity: 0,
      total: 0,
      status: "Pending",
    };
    updatePOLocal(poId, (po) => {
      const s = (po.subPOs || []).find((x) => x.id === subId);
      if (!s) {
        po.subPOs = po.subPOs || [];
        po.subPOs.push({
          id: subId,
          poId: po.id,
          title: "Auto",
          status: "Open",
          items: [newItem],
          productType: "Bộ",
          customerCode: "",
          size: "",
        } as any);
      } else {
        s.items = s.items || [];
        s.items.push(newItem);
      }
      return po;
    });
  };

  const handleRemoveItem = (poId: string, subId: string, itemId: string) => {
    if (!confirm("Remove this item?")) return;
    updatePOLocal(poId, (po) => {
      const s = (po.subPOs || []).find((x) => x.id === subId);
      if (s) s.items = (s.items || []).filter((it) => it.id !== itemId);
      return po;
    });
  };

  const handleChangeItemField = (
    poId: string,
    subId: string,
    itemId: string,
    field: keyof POItem,
    value: any
  ) => {
    updatePOLocal(poId, (po) => {
      const s = (po.subPOs || []).find((x) => x.id === subId);
      if (s) {
        const it = (s.items || []).find((i) => i.id === itemId);
        if (it) {
          (it as any)[field] = value;
          const qty = Number(it.quantity ?? 0);
          const price = Number(it.unitPrice ?? 0);
          it.total = Number(qty * price);
        }
      }
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
      // successful: nothing else required; local state already reflects the change
    } catch (err: any) {
      // revert: fetch expanded PO from server to restore authoritative state
      console.error("Update failed, refetching sub-POs", err);
      if (refetchSubs) await refetchSubs();
    }
  };

  // Handler: update server item status
  const handleUpdateServerItemStatus = async (
    itemRaw: any,
    newStatus: string
  ) => {
    const idStr = String(resolveId(itemRaw));
    // Optimistic
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
      });
      if (touched) return copy;
      return prev;
    });

    try {
      await updatePoItem({ id: idStr, body: { status: newStatus } }).unwrap();
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

    // make a copy to allow rollback
    const prevCopy = expandedLocalDoc
      ? JSON.parse(JSON.stringify(expandedLocalDoc))
      : null;

    // optimistic remove
    setExpandedLocalDoc((prev: any) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      (copy.subPurchaseOrders || []).forEach((s: any) => {
        s.items = (s.items || []).filter(
          (it: any) => String(resolveId(it)) !== idStr
        );
      });
      // sync totals to orders
      syncTotalsToOrders(copy);
      return copy;
    });

    try {
      await deletePoItem(idStr).unwrap();
      // success: done
    } catch (err: any) {
      // rollback to previous local doc
      console.error("Delete failed, rolling back & refetching", err);
      if (prevCopy) setExpandedLocalDoc(prevCopy);
      if (refetchSubs) await refetchSubs();
      alert(
        "Delete failed: " + (err?.data?.message || err?.message || "unknown")
      );
    }
  };

  // Handler: update PO status (top-level PO)
  const handleUpdatePoStatus = async (poId: string, newStatus: string) => {
    // optimistic update in list
    setOrders((prev) =>
      prev.map((p) =>
        String(p.id) === String(poId) ? { ...p, status: newStatus } : p
      )
    );
    try {
      await updatePo({ id: poId, body: { status: newStatus } }).unwrap();
    } catch (err: any) {
      console.error("Update PO status failed", err);
      // revert by refetch entire list (cheapest reliable fallback)
      await refetch();
      alert(
        "Update PO status failed: " +
          (err?.data?.message || err?.message || "unknown")
      );
    }
  };

  // Handler: update sub-PO status (server expanded sub)
  const handleUpdateSubStatus = async (subIdRaw: any, newStatus: string) => {
    const subId = String(resolveId(subIdRaw));
    // optimistic in expandedLocalDoc
    setExpandedLocalDoc((prev: any) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      (copy.subPurchaseOrders || []).forEach((s: any) => {
        if (String(s._id ?? s.id) === subId) s.status = newStatus;
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

  // Handler: update sub-PO delivery date
  const handleUpdateSubDeliveryDate = async (
    subIdRaw: any,
    newDateStr: string
  ) => {
    const subId = String(resolveId(subIdRaw));
    // optimistic
    setExpandedLocalDoc((prev: any) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      (copy.subPurchaseOrders || []).forEach((s: any) => {
        if (String(s._id ?? s.id) === subId)
          s.deliveryDate = newDateStr || null;
      });
      return copy;
    });

    try {
      // backend expects a Date, but a string ISO date is fine
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

  // Handler: update sub-PO status + delivery date when creating from products (we already call createSubFromProducts elsewhere)
  // (No extra code needed here)

  return (
    <div style={{ padding: 16 }}>
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
            const totals = computeTotals(po);
            const isExpanded = expandedPoId === po.id;
            const localExpandedMatches =
              isExpanded &&
              expandedLocalDoc &&
              (String(expandedLocalDoc._id) === String(po.id) ||
                expandedLocalDoc._id === po.id);
            const serverSubs =
              (localExpandedMatches
                ? expandedLocalDoc.subPurchaseOrders
                : []) ?? [];

            return (
              <div key={po.id} className="card mb-3">
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
                        }}
                      >
                        <strong>{po.poNumber}</strong>
                        <span className="text-muted">({po.status})</span>
                        <small className="text-muted">• {po.poDate}</small>
                      </div>
                      <div className="small text-muted">{po.customer}</div>
                      <div className="small text-muted">{po.address}</div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      {/* PO status dropdown on the right */}
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

                  {/* ALWAYS VISIBLE: Inline SubPO editor area (local-only) */}
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
                          + Tạo Sub-PO (từ Product list)
                        </button>
                        <button
                          className="btn btn-outline-success btn-sm"
                          onClick={() => handleAddSubPO(po.id)}
                        >
                          + Tạo Sub-PO (trống)
                        </button>
                      </div>
                    </div>

                    {/* Server sub-POs when expanded */}
                    {isExpanded && (
                      <div style={{ marginBottom: 12 }}>
                        {isFetchingSubs ? (
                          <div className="text-muted">Loading sản phẩm...</div>
                        ) : serverSubs.length === 0 ? (
                          <div className="text-muted">Không có sản phẩm</div>
                        ) : (
                          serverSubs.map((s: any) => (
                            <div key={s._id ?? s.id} className="card mb-2">
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
                                      Delivery:{" "}
                                      {s.deliveryDate
                                        ? new Date(s.deliveryDate)
                                            .toISOString()
                                            .slice(0, 10)
                                        : "-"}
                                    </div>
                                  </div>

                                  <div style={{ textAlign: "right" }}>
                                    <div style={{ marginBottom: 6 }}>
                                      {/* Sub-PO status dropdown */}
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

                                    <div>
                                      {/* delivery date input */}
                                      <input
                                        type="date"
                                        className="form-control form-control-sm"
                                        style={{ width: 160 }}
                                        value={
                                          s.deliveryDate
                                            ? typeof s.deliveryDate === "string"
                                              ? s.deliveryDate.slice(0, 10)
                                              : new Date(s.deliveryDate)
                                                  .toISOString()
                                                  .slice(0, 10)
                                            : ""
                                        }
                                        onChange={(e) =>
                                          // optimistic update locally, send on change (immediate)
                                          handleUpdateSubDeliveryDate(
                                            s._id ?? s.id,
                                            e.target.value
                                          )
                                        }
                                      />
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
                                        <th style={{ width: 120 }}>Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(s.items || []).map((it: any) => {
                                        const itemId = resolveId(it);
                                        const amountVal = it.amount ?? 0;
                                        const unitPrice =
                                          it.ware?.unitPrice ?? 0;
                                        return (
                                          <tr key={itemId}>
                                            <td>
                                              {s.product?.code ?? it.id ?? ""}
                                            </td>

                                            <td>
                                              {it.ware
                                                ? it.ware.code ?? it.ware._id
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
                                              {/* amount input: local update on change, save on blur */}
                                              <input
                                                className="form-control form-control-sm"
                                                type="number"
                                                value={Number(it.amount ?? 0)}
                                                onChange={(e) => {
                                                  const v =
                                                    e.target.value === ""
                                                      ? 0
                                                      : Number(e.target.value);
                                                  // just update local copy
                                                  setExpandedLocalDoc(
                                                    (prev: any) => {
                                                      if (!prev) return prev;
                                                      const copy = JSON.parse(
                                                        JSON.stringify(prev)
                                                      );
                                                      (
                                                        copy.subPurchaseOrders ||
                                                        []
                                                      ).forEach((s2: any) => {
                                                        (
                                                          s2.items || []
                                                        ).forEach((ii: any) => {
                                                          if (
                                                            String(
                                                              resolveId(ii)
                                                            ) ===
                                                            String(
                                                              resolveId(it)
                                                            )
                                                          ) {
                                                            ii.amount = v;
                                                          }
                                                        });
                                                      });
                                                      syncTotalsToOrders(copy);
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

                                            <td style={{ textAlign: "right" }}>
                                              {unitPrice ?? "-"}
                                            </td>

                                            <td style={{ textAlign: "right" }}>
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
                                                    handleDeleteServerItem(it)
                                                  }
                                                >
                                                  Delete
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                      {(s.items || []).length === 0 && (
                                        <tr>
                                          <td
                                            colSpan={7}
                                            className="text-muted"
                                          >
                                            No items for this sub-PO
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          ))
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
            // map selected products (contains productId/deliveryDate/status)
            const payload = {
              purchaseOrderId: poId,
              products: selectedProducts.map((p: any) => ({
                productId: p.productId ?? p._id ?? p.unique_id,
                deliveryDate: p.deliveryDate,
                status: p.status,
              })),
            };
            await createSubFromProducts(payload).unwrap();
            // optionally refetch subPOs and POs
            if (refetchSubs) await refetchSubs();
            await refetch();
            // close modal
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
