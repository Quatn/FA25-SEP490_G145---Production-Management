// src/components/purchase-order-management/PurchaseOrderDetailModal.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { PurchaseOrder, SubPO, POItem } from "@/types/PurchaseOrderTypes";

type Props = {
  po: PurchaseOrder | null;
  onClose: () => void;
  /**
   * Optional callback used when user clicks Save changes.
   * Receives an updated PurchaseOrder object.
   */
  onSave?: (updated: PurchaseOrder) => void;
  /**
   * Optional callback to open your separate SubPO selector screen/modal.
   * Receives the current PO id and the subPO id (or undefined if creating).
   * Parent can open its own screen and then call onSave with the selected data.
   */
  onOpenSubPOSelector?: (poId: string | undefined, subPOId?: string) => void;
};

function makeId(prefix = "") {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;
}

export const PurchaseOrderDetailModal: React.FC<Props> = ({
  po,
  onClose,
  onSave,
  onOpenSubPOSelector,
}) => {
  const [local, setLocal] = useState<PurchaseOrder | null>(null);

  // initialize local state from prop
  useEffect(() => {
    if (!po) {
      setLocal(null);
      return;
    }
    // deep clone so we don't mutate parent data
    setLocal(JSON.parse(JSON.stringify(po)));
  }, [po]);

  // compute totals from local state
  const totals = useMemo(() => {
    if (!local) return { items: 0, value: 0 };
    let items = 0;
    let value = 0;
    (local.subPOs || []).forEach((s) => {
      (s.items || []).forEach((it) => {
        items += 1;
        const t =
          Number(
            it.total ??
              (it.unitPrice != null && it.quantity != null
                ? it.unitPrice * it.quantity
                : 0)
          ) || 0;
        value += t;
      });
    });
    return { items, value };
  }, [local]);

  // helpers to update local
  const updateLocal = (updater: (curr: PurchaseOrder) => PurchaseOrder) => {
    setLocal((curr) => {
      if (!curr) return curr;
      return updater(JSON.parse(JSON.stringify(curr)));
    });
  };

  const handleAddSubPO = () => {
    if (!local) return;
    const newSub: SubPO = {
      id: makeId("sub-"),
      poId: local.id,
      title: "New sub-PO",
      status: "Open",
      items: [],
    };
    updateLocal((curr) => {
      curr.subPOs = curr.subPOs || [];
      curr.subPOs.push(newSub);
      return curr;
    });
  };

  const handleRemoveSubPO = (subId: string) => {
    if (!local) return;
    if (!confirm("Remove this sub-PO?")) return;
    updateLocal((curr) => {
      curr.subPOs = (curr.subPOs || []).filter((s) => s.id !== subId);
      return curr;
    });
  };

  const handleChangeSubTitle = (subId: string, value: string) => {
    if (!local) return;
    updateLocal((curr) => {
      (curr.subPOs || []).forEach((s) => {
        if (s.id === subId) s.title = value;
      });
      return curr;
    });
  };

  const handleChangeSubStatus = (subId: string, value: string) => {
    if (!local) return;
    updateLocal((curr) => {
      (curr.subPOs || []).forEach((s) => {
        if (s.id === subId) s.status = value;
      });
      return curr;
    });
  };

  const handleAddItem = (subId: string) => {
    if (!local) return;
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
    updateLocal((curr) => {
      const s = (curr.subPOs || []).find((x) => x.id === subId);
      if (!s) {
        curr.subPOs = curr.subPOs || [];
        curr.subPOs.push({
          id: subId,
          poId: curr.id,
          title: "Auto",
          status: "Open",
          items: [newItem],
        });
      } else {
        s.items = s.items || [];
        s.items.push(newItem);
      }
      return curr;
    });
  };

  const handleRemoveItem = (subId: string, itemId: string) => {
    if (!local) return;
    if (!confirm("Remove this item?")) return;
    updateLocal((curr) => {
      const s = (curr.subPOs || []).find((x) => x.id === subId);
      if (s) s.items = (s.items || []).filter((it) => it.id !== itemId);
      return curr;
    });
  };

  const handleChangeItemField = (
    subId: string,
    itemId: string,
    field: keyof POItem,
    value: any
  ) => {
    if (!local) return;
    updateLocal((curr) => {
      const s = (curr.subPOs || []).find((x) => x.id === subId);
      if (s) {
        const it = (s.items || []).find((i) => i.id === itemId);
        if (it) {
          // typed assignment
          (it as any)[field] = value;
          // recalc total when qty or price changes
          const qty = Number(it.quantity ?? 0);
          const price = Number(it.unitPrice ?? 0);
          it.total = Number(qty * price);
        }
      }
      return curr;
    });
  };

  const handleSave = () => {
    if (!local) {
      onClose();
      return;
    }
    // compute totals into local
    const clone = JSON.parse(JSON.stringify(local)) as PurchaseOrder;
    let items = 0;
    let value = 0;
    (clone.subPOs || []).forEach((s) => {
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
    clone.totalItems = items;
    clone.totalValue = value;
    // callback
    if (onSave) onSave(clone);
    onClose();
  };

  const handleOpenSubPOSelector = (subId?: string) => {
    if (onOpenSubPOSelector) {
      onOpenSubPOSelector(local?.id, subId);
      return;
    }
    alert(
      "Sub-PO selector not implemented here. Parent can inject it via onOpenSubPOSelector."
    );
  };

  if (!local) return null;

  return (
    <div className="modal-backdrop" style={{ display: "block" }}>
      <div className="modal" role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">PO: {local.poNumber}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              {/* Header info */}
              <div style={{ marginBottom: 12 }}>
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <th style={{ width: 180 }}>PO Number</th>
                      <td>{local.poNumber}</td>
                      <th style={{ width: 180 }}>Date</th>
                      <td>{local.poDate}</td>
                    </tr>
                    <tr>
                      <th>Customer</th>
                      <td>{local.customer}</td>
                      <th>Phone / Email</th>
                      <td>
                        {local.phone} / {local.email}
                      </td>
                    </tr>
                    <tr>
                      <th>Tax Template</th>
                      <td>{local.taxTemplate}</td>
                      <th>PO Type</th>
                      <td>{local.poType}</td>
                    </tr>
                    <tr>
                      <th>Style</th>
                      <td>{local.style}</td>
                      <th>Style Details</th>
                      <td>{local.styleDetails}</td>
                    </tr>
                    {/* <tr>
                      <th>Totals</th>
                      <td>{totals.items} items</td>
                      <th>Total Value</th>
                      <td>{totals.value}</td>
                    </tr> */}
                  </tbody>
                </table>
              </div>

              {/* Sub-PO section */}
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <h6 className="m-0">Sub-POs</h6>
                  <div>
                    <button
                      className="btn btn-outline-success btn-sm"
                      onClick={handleAddSubPO}
                    >
                      + Add Sub-PO
                    </button>
                  </div>
                </div>

                {(local.subPOs || []).map((s) => (
                  <div key={s.id} className="card mb-2">
                    <div className="card-body">
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <input
                          className="form-control"
                          style={{ maxWidth: 420 }}
                          value={s.title}
                          onChange={(e) =>
                            handleChangeSubTitle(s.id, e.target.value)
                          }
                        />
                        <select
                          className="form-select"
                          style={{ width: 160 }}
                          value={s.status ?? "Open"}
                          onChange={(e) =>
                            handleChangeSubStatus(s.id, e.target.value)
                          }
                        >
                          <option value="Open">Open</option>
                          <option value="Waiting">Waiting</option>
                          <option value="InProgress">InProgress</option>
                          <option value="Done">Done</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        <div style={{ marginLeft: 8 }}>
                          {s.productType && (
                            <span className="badge bg-secondary me-1">
                              Loại: {s.productType}
                            </span>
                          )}
                          {s.customerCode && (
                            <span className="badge bg-light text-dark me-1">
                              Khách: {s.customerCode}
                            </span>
                          )}
                          {s.size && (
                            <span className="badge bg-info text-dark">
                              Size: {s.size}
                            </span>
                          )}
                        </div>

                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleOpenSubPOSelector(s.id)}
                        >
                          Select sub-PO
                        </button>

                        <div style={{ flex: 1 }} />

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRemoveSubPO(s.id)}
                        >
                          Remove sub-PO
                        </button>
                      </div>

                      {/* PO items inside subPO */}
                      <div>
                        <div style={{ marginBottom: 8 }}>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleAddItem(s.id)}
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
                                <th>UOM</th>
                                <th style={{ textAlign: "right" }}>Số lượng</th>
                                <th style={{ textAlign: "right" }}>Đơn giá</th>
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
                                          s.id,
                                          it.id,
                                          "description",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>{it.waveType ?? "-"}</td>
                                  <td>{it.grammage ?? "-"}</td>
                                  <td>
                                    <input
                                      className="form-control form-control-sm"
                                      value={it.uom}
                                      onChange={(e) =>
                                        handleChangeItemField(
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
                                        it.unitPrice ??
                                        0 * it.quantity
                                    ).toLocaleString()}
                                  </td>

                                  <td>
                                    <div style={{ display: "flex", gap: 6 }}>
                                      {/* <button
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => {
                                          // quick mark as Done
                                          handleChangeItemField(
                                            s.id,
                                            it.id,
                                            "status",
                                            "Done"
                                          );
                                        }}
                                      >
                                        Mark Done
                                      </button> */}
                                      <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() =>
                                          handleRemoveItem(s.id, it.id)
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

                {(local.subPOs || []).length === 0 && (
                  <div className="text-muted">No sub-POs yet</div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderDetailModal;
