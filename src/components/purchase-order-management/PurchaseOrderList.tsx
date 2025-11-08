// src/components/purchase-order-management/PurchaseOrderList.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { PurchaseOrder, SubPO, POItem } from "@/types/PurchaseOrderTypes";
import { mockPurchaseOrdersQuery } from "@/service/mock-data/functions/paper-an-renamelater/mock-purchase-orders-crud";
import PurchaseOrderDetailModal from "./PurchaseOrderDetailModal";
import ProductSelectorModal, { ProductCard } from "./SubPOSelectorModal";

/**
 * PurchaseOrderList with inline SubPO / POItem editor shown for every PO (always visible).
 * Now integrated with ProductSelectorModal: "Tạo Sub-PO" opens product selection popup.
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

  // state for product selector
  const [productModalOpenForPo, setProductModalOpenForPo] = useState<{
    open: boolean;
    poId?: string;
  }>({ open: false });

  useEffect(() => {
    (async () => {
      const res: any = await mockPurchaseOrdersQuery({});
      // accept multiple shapes
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

  // update a single PO by id
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

  // create subPOs + items from selected products
  const handleCreateSubPOsFromProducts = (
    poId: string | undefined,
    selectedProducts: ProductCard[]
  ) => {
    if (!poId) return;
    updatePO(poId, (po) => {
      po.subPOs = po.subPOs || [];
      for (const prod of selectedProducts) {
        const newSubId = makeId("sub-");
        const newSub: SubPO = {
          id: newSubId,
          poId: po.id,
          title: `${prod.product_code} • ${prod.product_name}`,
          status: "Open",
          items: [],
          // metadata copied from product
          productType: prod.product_type,
          customerCode: prod.customer_code,
          size: [prod.length ?? "", prod.width ?? "", prod.height ?? ""].join(
            "×"
          ),
        };

        // map item_codes -> PO items; description taken from product.description
        newSub.items = (prod.item_codes || []).map((it) => {
          const newItem: POItem = {
            id: makeId("item-"),
            subPOId: newSubId,
            sku: it.product_code,
            // set description from Product (not item_code) so user sees product description
            description: prod.description ?? "",
            uom: "PCS",
            unitPrice: 0,
            quantity: 0,
            total: 0,
            status: "Pending",
            // initial wave/grammage taken from item code if present
            waveType: it.wave_type,
            grammage: it.paper_size,
          };
          return newItem;
        });

        po.subPOs.push(newSub);
      }
      return po;
    });
  };

  // existing inline subPO & item functions (add/remove/edit) - kept as before
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
    updatePO(poId, (po) => {
      po.subPOs = po.subPOs || [];
      po.subPOs.push(newSub);
      return po;
    });
  };

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

  // <-- NEW handlers to edit productType, customerCode, size -->
  const handleChangeSubProductType = (
    poId: string,
    subId: string,
    value: string
  ) => {
    updatePO(poId, (po) => {
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
    updatePO(poId, (po) => {
      (po.subPOs || []).forEach((s) => {
        if (s.id === subId) (s as any).customerCode = value;
      });
      return po;
    });
  };

  const handleChangeSubSize = (poId: string, subId: string, value: string) => {
    updatePO(poId, (po) => {
      (po.subPOs || []).forEach((s) => {
        if (s.id === subId) (s as any).size = value;
      });
      return po;
    });
  };
  // <-- end new handlers -->

  // items operations
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

                                      {/* Sóng editable */}
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

                                      {/* Khổ (grammage) editable */}
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
                                  {/* when empty, update colSpan to match the number of columns (9 columns here) */}
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

      {/* Product selector modal (scoped to PO id) */}
      <ProductSelectorModal
        show={productModalOpenForPo.open}
        onHide={() => setProductModalOpenForPo({ open: false })}
        onConfirm={(selectedProducts: ProductCard[]) => {
          // create subPOs & items under the selected PO
          handleCreateSubPOsFromProducts(
            productModalOpenForPo.poId,
            selectedProducts
          );
          setProductModalOpenForPo({ open: false });
        }}
      />

      <PurchaseOrderDetailModal
        po={selected}
        onClose={() => setSelected(null)}
        onSave={(updatedPo: PurchaseOrder) => {
          setOrders((prev) =>
            prev.map((p) => (p.id === updatedPo.id ? updatedPo : p))
          );
          setSelected(null);
        }}
      />
    </div>
  );
};

export default PurchaseOrderList;
