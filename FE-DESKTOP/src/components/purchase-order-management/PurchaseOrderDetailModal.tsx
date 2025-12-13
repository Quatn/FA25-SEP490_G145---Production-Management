"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { PurchaseOrder, SubPO } from "@/types/PurchaseOrderTypes";
import { useGetAllCustomersQuery } from "@/service/api/customerApiSlice";
import { useGetPurchaseOrderWithSubsQuery } from "@/service/api/purchaseOrderApiSlice";
import { toaster } from "@/components/ui/toaster";

type SaveResult =
  | { success: true }
  | {
      success: false;
      errors?: {
        poNumberRequired?: boolean;
        customerRequired?: boolean;
        taxTemplateRequired?: boolean;
        poNumberDuplicate?: boolean;
      };
      message?: string;
    };

type Props = {
  po: PurchaseOrder | null;
  onClose: () => void;
  // onSave now returns a Promise-like result that indicates success/errors
  onSave?: (updated: PurchaseOrder) => Promise<SaveResult> | SaveResult | void;
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

  // local validation flags (now includes poNumberRequired)
  const [validation, setValidation] = useState({
    poNumberRequired: false,
    customerRequired: false,
    taxTemplateRequired: false,
  });

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
    setValidation({
      poNumberRequired: false,
      customerRequired: false,
      taxTemplateRequired: false,
    });
  }, [po]);

  useEffect(() => {
    if (!po) {
      setLocal(null);
      return;
    }

    const clone: any = JSON.parse(JSON.stringify(po));

    // ONLY use fullResp when we actually have a serverId (prevents stale merge)
    const serverDoc =
      serverId && (fullResp?.data ?? fullResp)
        ? fullResp?.data ?? fullResp
        : null;

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
      // handle customer populate (serverDoc.customer may be object or id string)
      if (serverDoc.customer && typeof serverDoc.customer !== "string") {
        clone.customerId = serverDoc.customer._id ?? serverDoc.customer;
        clone.customer =
          serverDoc.customer.name ?? serverDoc.customer.code ?? clone.customer;
        // copy contact fields from customer object if available
        clone.phone = serverDoc.customer.contactNumber ?? clone.phone ?? "";
        clone.email = serverDoc.customer.email ?? clone.email ?? "";
        // prefer customer.address if PO deliveryAddress is missing
        clone.address =
          clone.address || serverDoc.customer.address || clone.address || "";
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

    // If clone has only a customer id (string) or po.customerId exists,
    // try to find the customer object from the customers list and copy contact fields.
    const custIdCandidate =
      (clone.customerId && String(clone.customerId)) ||
      (serverDoc && serverDoc.customer && typeof serverDoc.customer === "string"
        ? serverDoc.customer
        : null);

    if (custIdCandidate) {
      const matched = customers.find((c) => {
        const id = c._id?.$oid ?? c._id ?? c;
        return String(id) === String(custIdCandidate);
      });
      if (matched) {
        clone.customerId = matched._id?.$oid ?? matched._id ?? matched;
        clone.customer = matched.name ?? matched.code ?? clone.customer;
        // copy over phone/email/address if present on customer and not already present
        clone.phone = matched.contactNumber ?? clone.phone ?? "";
        clone.email = matched.email ?? clone.email ?? "";
        // for PO deliveryAddress we prefer the PO's own deliveryAddress; otherwise use customer's address
        clone.address = clone.address || matched.address || clone.address || "";
      }
    }

    setLocal(clone);
  }, [po, serverId, fullResp, customers]);

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

  // When a customer is selected: populate contact info & delivery address from customer object (if present).
  // Also make phone/email/address readonly while a customer is selected.
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

      // fill contact fields from the customer object if available (fields optional)
      copy.phone = c?.contactNumber ?? copy.phone ?? "";
      copy.email = c?.email ?? copy.email ?? "";
      // set delivery address from customer if available
      // (PO.deliveryAddress should prefer existing PO.address; but when selecting customer for a new PO,
      // we put customer's address into the PO's deliveryAddress)
      copy.address = c?.address ?? copy.address ?? "";
      return copy;
    });

    // clear customer validation when user picks one
    setValidation((v) => ({ ...v, customerRequired: false }));
  };

  // Save handler in modal now awaits parent's onSave result and acts on it (show inline messages & keep modal open on validation errors)
  const handleSave = async () => {
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

    if (!onSave) {
      // fallback: close if no parent handler provided
      onClose();
      return;
    }

    try {
      const res = await onSave(clone);
      // if parent didn't return a structured result, assume success
      if (res === undefined) {
        onClose();
        return;
      }
      if ((res as any).success) {
        onClose();
        return;
      }
      // failure -> set inline validation flags (if provided)
      const err = (res as any) ?? {};
      setValidation({
        poNumberRequired:
          !!err.errors?.poNumberRequired || !!err.errors?.poNumberDuplicate,
        customerRequired: !!err.errors?.customerRequired,
        taxTemplateRequired: !!err.errors?.taxTemplateRequired,
      });
      // also show message when available (non-field error)
      if (err.message) {
        toaster.create({ description: err.message, type: "error" });
      }
    } catch (e: any) {
      console.error("onSave threw", e);
      toaster.create({
        description: "Save failed: " + (e?.message ?? "unknown"),
        type: "error",
      });
    }
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

  // Make header contact fields readOnly when a customer is selected (customerId indicates selection)
  const readOnlyWhenCustomer = Boolean((local as any).customerId);

  return (
    <div className="modal-backdrop" style={{ display: "block" }}>
      <div className="modal" role="dialog" style={{ display: "block" }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Purchase Order: {local.poNumber || "mới"}
              </h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              {/* Header form */}
              <div style={{ marginBottom: 12 }}>
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <th style={{ width: 180 }}>
                        Mã PO <span className="text-danger">*</span>
                      </th>
                      <td>
                        <input
                          className="form-control"
                          value={local.poNumber ?? ""}
                          onChange={(e) => {
                            onFieldChange("poNumber" as any, e.target.value);
                            if (
                              validation.poNumberRequired &&
                              String(e.target.value).trim()
                            ) {
                              setValidation((v) => ({
                                ...v,
                                poNumberRequired: false,
                              }));
                            }
                          }}
                          aria-required={true}
                        />
                        {validation.poNumberRequired && (
                          <div className="text-danger small mt-1">
                            Mã PO là bắt buộc hoặc đã bị trùng.
                          </div>
                        )}
                      </td>

                      <th style={{ width: 180 }}>
                        Ngày nhập <span className="text-danger">*</span>
                      </th>
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
                          aria-required={true}
                        />
                      </td>
                    </tr>

                    <tr>
                      <th>
                        Khách hàng <span className="text-danger">*</span>
                      </th>
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
                        {validation.customerRequired && (
                          <div className="text-danger small mt-1">
                            Khách hàng là bắt buộc.
                          </div>
                        )}
                      </td>

                      <th>Điện thoại / Email</th>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            className="form-control"
                            placeholder="Phone"
                            value={local.phone ?? ""}
                            readOnly={readOnlyWhenCustomer}
                            onChange={(e) =>
                              onFieldChange("phone" as any, e.target.value)
                            }
                            aria-required={false}
                          />
                          <input
                            className="form-control"
                            placeholder="Email"
                            value={local.email ?? ""}
                            readOnly={readOnlyWhenCustomer}
                            onChange={(e) =>
                              onFieldChange("email" as any, e.target.value)
                            }
                            aria-required={false}
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
                          readOnly={readOnlyWhenCustomer}
                          onChange={(e) =>
                            onFieldChange("address" as any, e.target.value)
                          }
                          aria-required={false}
                        />
                      </td>

                      <th>
                        Phương thức thanh toán{" "}
                        <span className="text-danger">*</span>
                      </th>
                      <td>
                        <input
                          className="form-control"
                          value={local.taxTemplate ?? ""}
                          onChange={(e) => {
                            onFieldChange("taxTemplate" as any, e.target.value);
                            if (
                              validation.taxTemplateRequired &&
                              String(e.target.value).trim()
                            ) {
                              setValidation((v) => ({
                                ...v,
                                taxTemplateRequired: false,
                              }));
                            }
                          }}
                          aria-required={true}
                        />
                        {validation.taxTemplateRequired && (
                          <div className="text-danger small mt-1">
                            Phương thức thanh toán là bắt buộc.
                          </div>
                        )}
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
