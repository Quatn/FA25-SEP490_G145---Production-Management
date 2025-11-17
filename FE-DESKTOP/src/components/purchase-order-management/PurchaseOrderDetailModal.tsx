"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { PurchaseOrder, SubPO, POItem } from "@/types/PurchaseOrderTypes";
import { useGetAllCustomersQuery } from "@/service/api/customerApiSlice";
import { useGetPurchaseOrderWithSubsQuery } from "@/service/api/purchaseOrderApiSlice";

type Props = {
  po: PurchaseOrder | null;
  onClose: () => void;
  onSave?: (updated: PurchaseOrder) => void;
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

  // customers list
  const { data: customerResp } = useGetAllCustomersQuery();
  const customers: any[] = (() => {
    if (!customerResp) return [];
    if (Array.isArray(customerResp)) return customerResp;
    if (Array.isArray((customerResp as any).data))
      return (customerResp as any).data;
    return [];
  })();

  // fetch full server doc (subPOs + items) when editing an existing server PO
  const serverId = po?.id && !String(po.id).startsWith("local-") ? po.id : "";
  const { data: fullResp } = useGetPurchaseOrderWithSubsQuery(serverId, {
    skip: !serverId,
  });

  useEffect(() => {
    if (!po) {
      setLocal(null);
      return;
    }

    const clone: any = JSON.parse(JSON.stringify(po));

    // if server response exists, merge subPurchaseOrders/items into local state
    const serverDoc = fullResp?.data ?? fullResp ?? null;
    if (serverDoc) {
      clone.subPOs = (serverDoc.subPurchaseOrders || []).map((s: any) => {
        return {
          id: s._id ?? s.code ?? makeId("sub-"),
          poId: serverDoc._id ?? serverDoc.id,
          title: s.code ?? s.product?.name ?? "",
          status: s.status ?? "",
          productRef: s.product ?? null,
          items: (s.items || []).map((it: any) => ({
            id: it._id ?? it.code ?? makeId("item-"),
            subPOId: s._id ?? s.id,
            sku: it.code ?? "",
            description: it.note ?? "",
            uom: "PCS",
            unitPrice: it.ware?.unitPrice ?? 0,
            quantity: it.amount ?? 0,
            total: (it.amount ?? 0) * (it.ware?.unitPrice ?? 0),
            status: it.status ?? "",
            wareRef: it.ware ?? null,
          })),
        } as SubPO;
      });
      // ensure header fields map to our local keys
      clone.poNumber = serverDoc.code ?? clone.poNumber;
      clone.poDate = serverDoc.orderDate
        ? new Date(serverDoc.orderDate).toISOString().slice(0, 10)
        : clone.poDate;
      clone.address =
        serverDoc.deliveryAddress ?? serverDoc.deliveryAdress ?? clone.address;
      clone.notes = serverDoc.note ?? clone.notes;
      // handle customer populate
      if (serverDoc.customer && typeof serverDoc.customer !== "string") {
        clone.customerId = serverDoc.customer._id ?? serverDoc.customer;
        clone.customer =
          serverDoc.customer.name ?? serverDoc.customer.code ?? clone.customer;
      }
    } else {
      // incoming local PO might have customer populated - ensure customerId exists
      if (
        !clone.customerId &&
        clone.customer &&
        typeof clone.customer !== "string"
      ) {
        clone.customerId = clone.customer._id ?? clone.customer;
      }
    }

    setLocal(clone);
  }, [po, fullResp]);

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
              (it.unitPrice && it.quantity ? it.unitPrice * it.quantity : 0)
          ) || 0;
        value += t;
      });
    });
    return { items, value };
  }, [local]);

  const updateLocal = (updater: (curr: PurchaseOrder) => PurchaseOrder) => {
    setLocal((curr) => {
      if (!curr) return curr;
      return updater(JSON.parse(JSON.stringify(curr)));
    });
  };

  const onFieldChange = (field: keyof PurchaseOrder, value: any) => {
    setLocal((curr) => {
      if (!curr) return curr;
      const copy = JSON.parse(JSON.stringify(curr));
      (copy as any)[field] = value;
      return copy;
    });
  };

  const handleCustomerSelect = (customerId: string) => {
    setLocal((curr) => {
      if (!curr) return curr;
      const copy = JSON.parse(JSON.stringify(curr));
      copy.customerId = customerId || undefined;
      const c = customers.find((x) => {
        const id = x._id?.$oid ?? x._id ?? x;
        return String(id) === String(customerId);
      });
      copy.customer = c
        ? c.name ?? c.code ?? String(customerId)
        : String(customerId);
      return copy;
    });
  };

  /* Sub-PO & item handlers (local edits) */
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
        } as any);
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
          (it as any)[field] = value;
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
    // compute totals
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

  const selectedCustomerId = (() => {
    const c = (local as any).customerId ?? local.customer;
    if (!c) return "";
    if (typeof c === "string") return c;
    return c._id?.$oid ?? c._id ?? "";
  })();

  return (
    <div className="modal-backdrop" style={{ display: "block" }}>
      <div className="modal" role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">PO: {local.poNumber || "(new)"}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              {/* Header form */}
              <div style={{ marginBottom: 12 }}>
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <th style={{ width: 180 }}>Mã PO</th>
                      <td>
                        <input
                          className="form-control"
                          value={local.poNumber ?? ""}
                          onChange={(e) =>
                            onFieldChange("poNumber" as any, e.target.value)
                          }
                        />
                      </td>

                      <th style={{ width: 180 }}>Ngày nhập</th>
                      <td>
                        <input
                          className="form-control"
                          type="date"
                          value={
                            local.poDate
                              ? typeof local.poDate === "string"
                                ? local.poDate.slice(0, 10)
                                : new Date(local.poDate)
                                    .toISOString()
                                    .slice(0, 10)
                              : ""
                          }
                          onChange={(e) =>
                            onFieldChange("poDate" as any, e.target.value)
                          }
                        />
                      </td>
                    </tr>

                    <tr>
                      <th>Khách hàng</th>
                      <td>
                        <select
                          className="form-select"
                          value={selectedCustomerId ?? ""}
                          onChange={(e) => handleCustomerSelect(e.target.value)}
                        >
                          <option value="">-- Chọn --</option>
                          {customers.map((c: any) => {
                            const id = c._id?.$oid ?? c._id ?? c;
                            const label = c.name ?? c.code ?? String(id);
                            return (
                              <option key={id} value={id}>
                                {label}
                              </option>
                            );
                          })}
                        </select>
                      </td>

                      <th>Điện thoại / Email</th>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            className="form-control"
                            placeholder="Phone"
                            value={local.phone ?? ""}
                            onChange={(e) =>
                              onFieldChange("phone" as any, e.target.value)
                            }
                          />
                          <input
                            className="form-control"
                            placeholder="Email"
                            value={local.email ?? ""}
                            onChange={(e) =>
                              onFieldChange("email" as any, e.target.value)
                            }
                          />
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <th>Địa chỉ giao hàng</th>
                      <td>
                        <input
                          className="form-control"
                          value={local.address ?? ""}
                          onChange={(e) =>
                            onFieldChange("address" as any, e.target.value)
                          }
                        />
                      </td>

                      <th>Phương thức thanh toán</th>
                      <td>
                        <input
                          className="form-control"
                          value={local.taxTemplate ?? ""}
                          onChange={(e) =>
                            onFieldChange("taxTemplate" as any, e.target.value)
                          }
                        />
                      </td>
                    </tr>

                    <tr>
                      <th>Note</th>
                      <td colSpan={3}>
                        <input
                          className="form-control"
                          value={local.notes ?? ""}
                          onChange={(e) =>
                            onFieldChange("notes" as any, e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Đóng
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderDetailModal;
