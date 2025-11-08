// src/components/purchase-order-management/PurchaseOrderList.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { PurchaseOrder, SubPO, POItem } from "@/types/PurchaseOrderTypes";
import { mockPurchaseOrdersQuery } from "@/service/mock-data/functions/paper-an-renamelater/mock-purchase-orders-crud";
import PurchaseOrderDetailModal from "./PurchaseOrderDetailModal";

/**
 * PurchaseOrderList with inline SubPO / POItem editor under each PO card.
 * Modal remains for view-only details.
 */

function makeId(prefix = "") {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;
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
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [query, setQuery] = useState<string>("");
  const [selected, setSelected] = useState<PurchaseOrder | null>(null);

  // which PO card editors are expanded
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const res: any = await mockPurchaseOrdersQuery({});
      console.log("mockPurchaseOrdersQuery ->", res);
      // accept multiple shapes (paginated wrapper or array)
      let payload: any[] = [];
      if (res) {
        if (Array.isArray(res)) payload = res;
        else if (Array.isArray(res.data)) payload = res.data;
        else if (Array.isArray(res.data?.purchaseOrders))
          payload = res.data.purchaseOrders;
        else if (Array.isArray(res.data?.data)) payload = res.data.data;
      }
      setOrders(payload || []);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        (o.poNumber || "").toLowerCase().includes(q) ||
        (o.customer || "").toLowerCase().includes(q)
    );
  }, [orders, query]);

  // update a single PO inside orders by id
  const updatePO = (
    poId: string,
    updater: (po: PurchaseOrder) => PurchaseOrder
  ) => {
    setOrders((prev) =>
      prev.map((p) =>
        p.id === poId ? updater(JSON.parse(JSON.stringify(p))) : p
      )
    );
  };

  // add a subPO to a PO
  const handleAddSubPO = (poId: string) => {
    const newSub: SubPO = {
      id: makeId("sub-"),
      poId,
      title: "New sub-PO",
      status: "Open",
      items: [],
    };
    updatePO(poId, (po) => {
      po.subPOs = po.subPOs || [];
      po.subPOs.push(newSub);
      return po;
    });
    setExpanded((s) => ({ ...s, [poId]: true }));
  };

  // remove a subPO
  const handleRemoveSubPO = (poId: string, subId: string) => {
    if (!confirm("Remove this sub-PO?")) return;
    updatePO(poId, (po) => {
      po.subPOs = (po.subPOs || []).filter((s) => s.id !== subId);
      return po;
    });
  };

  const handleChangeSubTitle = (poId: string, subId: string, value: string) => {
    updatePO(poId, (po) => {
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
    updatePO(poId, (po) => {
      (po.subPOs || []).forEach((s) => {
        if (s.id === subId) s.status = value;
      });
      return po;
    });
  };

  // items
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
    updatePO(poId, (po) => {
      const s = (po.subPOs || []).find((x) => x.id === subId);
      if (!s) {
        po.subPOs = po.subPOs || [];
        po.subPOs.push({
          id: subId,
          poId: po.id,
          title: "Auto",
          status: "Open",
          items: [newItem],
        });
      } else {
        s.items = s.items || [];
        s.items.push(newItem);
      }
      return po;
    });
  };

  const handleRemoveItem = (poId: string, subId: string, itemId: string) => {
    if (!confirm("Remove this item?")) return;
    updatePO(poId, (po) => {
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
    updatePO(poId, (po) => {
      const s = (po.subPOs || []).find((x) => x.id === subId);
      if (s) {
        const it = (s.items || []).find((i) => i.id === itemId);
        if (it) {
          (it as any)[field] = value;
          // recalc
          const qty = Number(it.quantity ?? 0);
          const price = Number(it.unitPrice ?? 0);
          it.total = Number(qty * price);
        }
      }
      return po;
    });
  };

  // compute totals on demand for display
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
        <button
          className="btn btn-outline-primary"
          onClick={() => alert("Tạo PO - not implemented")}
        >
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
        {filtered.length === 0 ? (
          <div className="text-muted">No purchase orders found</div>
        ) : (
          filtered.map((po) => {
            const totals = computeTotals(po);
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
                      <div>
                        Total items: <strong>{totals.items}</strong>
                      </div>
                      <div>
                        Total value: <strong>{totals.value}</strong>
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
                          View detail
                        </button>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() =>
                            setExpanded((s) => ({ ...s, [po.id]: !s[po.id] }))
                          }
                        >
                          {expanded[po.id] ? "Hide editor" : "Open editor"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Inline editor area */}
                  {expanded[po.id] && (
                    <div style={{ marginTop: 12 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <h6 className="m-0">Sub-POs (inline editor)</h6>
                        <button
                          className="btn btn-outline-success btn-sm"
                          onClick={() => handleAddSubPO(po.id)}
                        >
                          + Add Sub-PO
                        </button>
                      </div>

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
                                      <th>SKU</th>
                                      <th>Description</th>
                                      <th>UOM</th>
                                      <th style={{ textAlign: "right" }}>
                                        Qty
                                      </th>
                                      <th style={{ textAlign: "right" }}>
                                        Unit price
                                      </th>
                                      <th style={{ textAlign: "right" }}>
                                        Total
                                      </th>
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
                                            value={it.description}
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
                                            value={it.uom}
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
                                          {Number(
                                            it.total ??
                                              it.unitPrice ?? 0 * it.quantity
                                          ).toLocaleString()}
                                        </td>
                                        <td>
                                          <div
                                            style={{ display: "flex", gap: 6 }}
                                          >
                                            <button
                                              className="btn btn-outline-secondary btn-sm"
                                              onClick={() =>
                                                handleChangeItemField(
                                                  po.id,
                                                  s.id,
                                                  it.id,
                                                  "status",
                                                  "Done"
                                                )
                                              }
                                            >
                                              Mark Done
                                            </button>
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
                                        <td colSpan={7} className="text-muted">
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

                      {(po.subPOs || []).length === 0 && (
                        <div className="text-muted">No sub-POs yet</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <PurchaseOrderDetailModal
        po={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
};

export default PurchaseOrderList;
