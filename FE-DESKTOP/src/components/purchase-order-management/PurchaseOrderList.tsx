// src/components/purchase-order-management/PurchaseOrderList.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { PurchaseOrder, SubPO, POItem } from "@/types/PurchaseOrderTypes";
import PurchaseOrderDetailModal from "./PurchaseOrderDetailModal";
import ProductSelectorModal, { ProductCard } from "./SubPOSelectorModal";
import {
  useGetPurchaseOrdersQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
} from "@/service/api/purchaseOrderApiSlice";

/* ... same helper functions, normalizeServerPo updated to capture customer id ... */

function makeId(prefix = "") {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;
}

function normalizeServerPo(raw: any): PurchaseOrder {
  const id = raw._id?.$oid ?? raw._id ?? raw.id ?? String(Math.random());
  // extract customer id (may be populated object or raw id)
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
      // fallback: populated object
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
    address: raw.deliveryAdress ?? "",
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

  // product selector modal (local-only)
  const [productModalOpenForPo, setProductModalOpenForPo] = useState<{
    open: boolean;
    poId?: string;
  }>({ open: false });

  // api hooks
  const {
    data: poResp,
    isLoading,
    error,
    refetch,
  } = useGetPurchaseOrdersQuery({
    page: 1,
    limit: 200,
    search: "",
  });

  const [createPo] = useCreatePurchaseOrderMutation();
  const [updatePo] = useUpdatePurchaseOrderMutation();
  const [deletePo] = useDeletePurchaseOrderMutation();

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);

  useEffect(() => {
    const payload = poResp?.data?.data ?? poResp?.data ?? [];
    if (Array.isArray(payload)) {
      setOrders(payload.map(normalizeServerPo));
    } else {
      setOrders([]);
    }
  }, [poResp]);

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        (o.poNumber || "").toLowerCase().includes(q) ||
        (o.customer || "").toLowerCase().includes(q)
    );
  }, [orders, query]);

  // local updater: keeps inline edits local until user saves via modal
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
        deliveryAdress: updated.address,
        paymentTerms: updated.taxTemplate,
        note: updated.notes,
      };
      // attach customer ObjectId if present
      if ((updated as any).customerId) {
        payload.customer = (updated as any).customerId;
      } else if (updated.customer && typeof updated.customer === "string") {
        // if user typed a name and didn't select an id, don't send customer
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

  // Inline subPO helpers preserved (local-only)...
  const handleAddSubPO = (poId: string) => {
    const newSub: SubPO = {
      id: makeId("sub-"),
      poId: poId,
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
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteFromList(po)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ALWAYS VISIBLE: Inline SubPO editor area */}
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

                            {/* EDITABLE: Loại, Khách, Size */}
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

                          {/* items ... (unchanged) */}
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
                                              "waveType" as keyof POItem,
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
                                              "grammage" as keyof POItem,
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

                    {(po.subPOs || []).length === 0 && (
                      <div className="text-muted">No sub-POs yet</div>
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
        onConfirm={(selectedProducts: ProductCard[]) => {
          const poId = productModalOpenForPo.poId;
          if (!poId) {
            setProductModalOpenForPo({ open: false });
            return;
          }
          updatePOLocal(poId, (po) => {
            po.subPOs = po.subPOs || [];
            for (const prod of selectedProducts) {
              const newSubId = makeId("sub-");
              const newSub: SubPO = {
                id: newSubId,
                poId: po.id,
                title: `${prod.product_code} • ${prod.product_name}`,
                status: "Open",
                items: [],
                productType: prod.product_type,
                customerCode: prod.customer_code,
                size: [
                  prod.length ?? "",
                  prod.width ?? "",
                  prod.height ?? "",
                ].join("×"),
              };
              newSub.items = (prod.item_codes || []).map((it) => ({
                id: makeId("item-"),
                subPOId: newSubId,
                sku: it.product_code,
                description: prod.description ?? "",
                uom: "PCS",
                unitPrice: 0,
                quantity: 0,
                total: 0,
                status: "Pending",
                waveType: it.wave_type,
                grammage: it.paper_size,
              }));
              po.subPOs.push(newSub);
            }
            return po;
          });
          setProductModalOpenForPo({ open: false });
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
