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

/* Helper: generate temporary local ids for UI-created items */
function makeId(prefix = "") {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;
}

/* Normalize server PO -> UI PurchaseOrder type */
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

  /* --------------------------
     Inline local-only subPO & item handlers (UI-only)
     -------------------------- */
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
      // also re-sync totals once server data arrives (the useEffect above will set expandedLocalDoc)
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
                      {/* <div>
                        Total items: <strong>{totals.items}</strong>
                      </div>
                      <div>
                        Total value: <strong>{totals.value}</strong>
                      </div> */}
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
                          View detail
                        </button>
                        <button
                          className="btn btn-outline-info btn-sm"
                          onClick={() => toggleExpandSubs(po.id)}
                        >
                          {isExpanded ? "Hide Sub-POs" : "Show Sub-POs"}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteFromList(po)}
                        >
                          Delete
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
                      <h6 className="m-0">Sub-POs</h6>
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
                          + Add Sub-PO (empty)
                        </button>
                      </div>
                    </div>

                    {/* Server sub-POs when expanded */}
                    {isExpanded && (
                      <div style={{ marginBottom: 12 }}>
                        {isFetchingSubs ? (
                          <div className="text-muted">Loading sub-POs...</div>
                        ) : serverSubs.length === 0 ? (
                          <div className="text-muted">No server sub-POs</div>
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
                                    <strong>{s.code ?? s._id}</strong>
                                    <div className="small text-muted">
                                      {s.product?.name ??
                                        s.product?.code ??
                                        "-"}
                                    </div>
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
                                    <div className="small text-muted">
                                      Status: {s.status}
                                    </div>
                                  </div>
                                </div>

                                {/* items for sub-PO */}
                                <div style={{ marginTop: 8 }}>
                                  <table className="table table-sm table-bordered">
                                    <thead>
                                      <tr>
                                        <th>Item code</th>
                                        <th>Ware</th>
                                        <th>Amount</th>
                                        <th>Unit price</th>
                                        <th style={{ textAlign: "right" }}>
                                          Total
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
                                            <td>{it.code ?? it.code}</td>

                                            <td>
                                              {it.ware
                                                ? it.ware.code ?? it.ware._id
                                                : "-"}
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
                                                      ).forEach((s: any) => {
                                                        (s.items || []).forEach(
                                                          (ii: any) => {
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
                                                          }
                                                        );
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
                                            colSpan={6}
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

                    {(po.subPOs || []).map((s) => (
                      <div key={s.id} className="card mb-2">
                        <div className="card-body">
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "center",
                              marginBottom: 8,
                            }}
                          >
                            <input
                              className="form-control"
                              style={{ maxWidth: 420 }}
                              value={s.title}
                              onChange={(e) =>
                                handleChangeSubTitle(
                                  po.id,
                                  s.id,
                                  e.target.value
                                )
                              }
                            />
                            <select
                              className="form-select"
                              style={{ width: 160 }}
                              value={s.status ?? "Open"}
                              onChange={(e) =>
                                handleChangeSubStatus(
                                  po.id,
                                  s.id,
                                  e.target.value
                                )
                              }
                            >
                              <option value="Open">Open</option>
                              <option value="Waiting">Waiting</option>
                              <option value="InProgress">InProgress</option>
                              <option value="Done">Done</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>

                            <div
                              style={{
                                marginLeft: 8,
                                display: "flex",
                                gap: 8,
                                alignItems: "center",
                              }}
                            >
                              <select
                                className="form-select form-select-sm"
                                style={{ width: 120 }}
                                value={(s as any).productType ?? "Bộ"}
                                onChange={(e) =>
                                  handleChangeSubProductType(
                                    po.id,
                                    s.id,
                                    e.target.value
                                  )
                                }
                              >
                                <option value="Bộ">Bộ</option>
                                <option value="Lẻ">Lẻ</option>
                              </select>

                              <input
                                className="form-control form-control-sm"
                                style={{ width: 160 }}
                                placeholder="Khách"
                                value={(s as any).customerCode ?? ""}
                                onChange={(e) =>
                                  handleChangeSubCustomerCode(
                                    po.id,
                                    s.id,
                                    e.target.value
                                  )
                                }
                              />

                              <input
                                className="form-control form-control-sm"
                                style={{ width: 160 }}
                                placeholder="Size (L×W×H)"
                                value={(s as any).size ?? ""}
                                onChange={(e) =>
                                  handleChangeSubSize(
                                    po.id,
                                    s.id,
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div style={{ flex: 1 }} />

                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRemoveSubPO(po.id, s.id)}
                            >
                              Remove sub-PO
                            </button>
                          </div>

                          {/* items */}
                          <div style={{ marginTop: 6 }}>
                            <div style={{ marginBottom: 6 }}>
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handleAddItem(po.id, s.id)}
                              >
                                + Add item
                              </button>
                            </div>

                            <div style={{ overflowX: "auto" }}>
                              <table className="table table-sm table-bordered">
                                <thead>
                                  <tr>
                                    <th>Mã hàng</th>
                                    <th>Mô tả</th>
                                    <th>Sóng</th>
                                    <th>Khổ</th>
                                    <th>Đơn vị</th>
                                    <th style={{ textAlign: "right" }}>
                                      Số lượng
                                    </th>
                                    <th style={{ textAlign: "right" }}>
                                      Đơn giá
                                    </th>
                                    <th style={{ textAlign: "right" }}>Tổng</th>
                                    <th style={{ width: 120 }}>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(s.items || []).map((it) => (
                                    <tr key={it.id}>
                                      <td>
                                        <input
                                          className="form-control form-control-sm"
                                          value={it.sku}
                                          onChange={(e) =>
                                            handleChangeItemField(
                                              po.id,
                                              s.id,
                                              it.id,
                                              "sku",
                                              e.target.value
                                            )
                                          }
                                        />
                                      </td>
                                      <td>
                                        <input
                                          className="form-control form-control-sm"
                                          value={it.description ?? ""}
                                          onChange={(e) =>
                                            handleChangeItemField(
                                              po.id,
                                              s.id,
                                              it.id,
                                              "description",
                                              e.target.value
                                            )
                                          }
                                        />
                                      </td>
                                      <td>
                                        <input
                                          className="form-control form-control-sm"
                                          value={(it as any).waveType ?? ""}
                                          onChange={(e) =>
                                            handleChangeItemField(
                                              po.id,
                                              s.id,
                                              it.id,
                                              "waveType" as any,
                                              e.target.value
                                            )
                                          }
                                        />
                                      </td>
                                      <td>
                                        <input
                                          className="form-control form-control-sm"
                                          type="number"
                                          value={(it as any).grammage ?? ""}
                                          onChange={(e) =>
                                            handleChangeItemField(
                                              po.id,
                                              s.id,
                                              it.id,
                                              "grammage" as any,
                                              e.target.value === ""
                                                ? undefined
                                                : Number(e.target.value)
                                            )
                                          }
                                        />
                                      </td>
                                      <td>
                                        <input
                                          className="form-control form-control-sm"
                                          value={it.uom ?? ""}
                                          onChange={(e) =>
                                            handleChangeItemField(
                                              po.id,
                                              s.id,
                                              it.id,
                                              "uom",
                                              e.target.value
                                            )
                                          }
                                        />
                                      </td>
                                      <td style={{ textAlign: "right" }}>
                                        <input
                                          className="form-control form-control-sm"
                                          type="number"
                                          value={it.quantity}
                                          onChange={(e) =>
                                            handleChangeItemField(
                                              po.id,
                                              s.id,
                                              it.id,
                                              "quantity",
                                              Number(e.target.value)
                                            )
                                          }
                                        />
                                      </td>
                                      <td style={{ textAlign: "right" }}>
                                        <input
                                          className="form-control form-control-sm"
                                          type="number"
                                          value={it.unitPrice}
                                          onChange={(e) =>
                                            handleChangeItemField(
                                              po.id,
                                              s.id,
                                              it.id,
                                              "unitPrice",
                                              Number(e.target.value)
                                            )
                                          }
                                        />
                                      </td>
                                      <td style={{ textAlign: "right" }}>
                                        {Number(it.total ?? 0).toLocaleString()}
                                      </td>
                                      <td>
                                        <div
                                          style={{ display: "flex", gap: 6 }}
                                        >
                                          <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() =>
                                              handleRemoveItem(
                                                po.id,
                                                s.id,
                                                it.id
                                              )
                                            }
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                  {(s.items || []).length === 0 && (
                                    <tr>
                                      <td colSpan={9} className="text-muted">
                                        No items yet
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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
