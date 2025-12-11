// src/components/purchase-order-management/PurchaseOrderList.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { PurchaseOrder } from "@/types/PurchaseOrderTypes";
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
import { toaster } from "@/components/ui/toaster";
import { useConfirm } from "@/components/common/ConfirmModal";

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
    // default to DRAFT if missing
    status: raw.status ?? "DRAFT",
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

// reduced statuses
const PO_STATUS_OPTIONS = ["DRAFT", "PENDINGAPPROVAL", "APPROVED"];
const SUBPO_STATUS_OPTIONS = ["DRAFT", "PENDINGAPPROVAL", "APPROVED"];
const POITEM_STATUS_OPTIONS = ["DRAFT", "PENDINGAPPROVAL", "APPROVED"];

const PurchaseOrderList: React.FC = () => {
  const confirm = useConfirm();
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

  // guard for creating sub-POs to avoid double submissions
  const [isCreatingSubs, setIsCreatingSubs] = useState(false);

  // safe refetch helper for the subs query
  const safeRefetchSubs = async () => {
    try {
      if (!expandedPoId) return; // don't call refetch if no target id
      if (typeof refetchSubs !== "function") return;
      await refetchSubs();
    } catch (err) {
      console.warn("safeRefetchSubs: skipping refetch because it failed", err);
    }
  };

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
      // Basic client-side validation for PO number uniqueness
      const trimmedPoNumber = (updated.poNumber || "").trim();
      // require PO number for creation or update (adjust if empty allowed in your business logic)
      if (!trimmedPoNumber) {
        toaster.create({
          description: "PO number is required.",
          type: "error",
        });
        return;
      }

      const conflict = orders.find(
        (o) =>
          (o.poNumber || "").trim().toLowerCase() ===
            trimmedPoNumber.toLowerCase() && String(o.id) !== String(updated.id)
      );

      if (conflict) {
        toaster.create({
          description: `PO number "${trimmedPoNumber}" already exists (PO id: ${conflict.id}). Please use a different PO number.`,
          type: "error",
        });
        return;
      }

      const payload: any = {
        code: trimmedPoNumber,
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
      try {
        if (typeof refetch === "function") await refetch();
      } catch (e) {
        console.warn("refetch purchase orders failed", e);
      }
      setSelected(null);
    } catch (err: any) {
      console.error("Save PO failed", err);
      toaster.create({
        description:
          "Save failed: " + (err?.data?.message || err?.message || "unknown"),
        type: "error",
      });
    }
  };

  const handleDeleteFromList = async (po: PurchaseOrder) => {
    if (!po?.id) return;
    // only allow delete if PO is DRAFT
    if (po.status !== "DRAFT") {
      toaster.create({
        description: "Chỉ có thể xóa khi PO ở trạng thái DRAFT.",
        type: "error",
      });
      return;
    }
    const ok = await confirm({
      title: "Delete Purchase Order",
      description: "Delete this Purchase Order?",
      confirmText: "Delete",
      cancelText: "Cancel",
      destructive: true,
    });
    if (!ok) return;
    try {
      await deletePo(po.id).unwrap();
      try {
        if (typeof refetch === "function") await refetch();
      } catch (e) {
        console.warn("refetch purchase orders failed", e);
      }
    } catch (err: any) {
      console.error("Delete failed", err);
      toaster.create({
        description:
          "Delete failed: " + (err?.data?.message || err?.message || "unknown"),
        type: "error",
      });
    }
  };

  const toggleExpandSubs = (poId: string) => {
    setExpandedPoId((prev) => (prev === poId ? null : poId));
  };

  // Handler: update server item amount
  const handleUpdateServerItemAmount = async (
    itemIdRaw: any,
    newAmount: number
  ) => {
    const idStr = String(resolveId(itemIdRaw));

    // check editability: item & its parents must be DRAFT
    if (!expandedLocalDoc) {
      // safe fallback
      toaster.create({
        description: "Không thể sửa - dữ liệu chưa tải xong.",
        type: "error",
      });
      return;
    }

    // find parent sub and po
    const parentPOId = String(
      expandedLocalDoc._id ?? expandedLocalDoc.id ?? expandedPoId ?? ""
    );
    const parentPO = orders.find((o) => String(o.id) === String(parentPOId));
    if (!parentPO || parentPO.status !== "DRAFT") {
      toaster.create({
        description: "Chỉ có thể sửa item khi PO ở trạng thái DRAFT.",
        type: "error",
      });
      return;
    }

    let itemStatus: string | null = null;
    let parentSubStatus: string | null = null;
    (expandedLocalDoc.subPurchaseOrders || []).forEach((s: any) => {
      (s.items || []).forEach((it: any) => {
        if (String(resolveId(it)) === idStr) {
          itemStatus = it.status ?? "DRAFT";
          parentSubStatus = s.status ?? "DRAFT";
        }
      });
    });
    if (itemStatus !== "DRAFT" || parentSubStatus !== "DRAFT") {
      toaster.create({
        description:
          "Chỉ có thể sửa item khi PO và Sub-PO đều ở trạng thái DRAFT.",
        type: "error",
      });
      return;
    }

    // Optimistic update locally
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
        syncTotalsToOrders(copy);
        return copy;
      }
      return prev;
    });

    try {
      await updatePoItem({
        id: idStr,
        body: { amount: Number(newAmount ?? 0) },
      }).unwrap();
    } catch (err: any) {
      console.error("Update failed, refetching sub-POs", err);
      await safeRefetchSubs();
    }
  };

  // Handler: update server item status
  const handleUpdateServerItemStatus = async (
    itemRaw: any,
    newStatus: string
  ) => {
    const idStr = String(resolveId(itemRaw));

    if (!expandedLocalDoc) {
      toaster.create({
        description:
          "Không thể thay đổi trạng thái item - dữ liệu chưa tải xong.",
        type: "error",
      });
      return;
    }
    const parentPOId = String(
      expandedLocalDoc._id ?? expandedLocalDoc.id ?? expandedPoId ?? ""
    );
    const parentPO = orders.find((o) => String(o.id) === String(parentPOId));
    if (!parentPO || parentPO.status !== "DRAFT") {
      toaster.create({
        description:
          "Chỉ có thể thay đổi trạng thái item khi PO ở trạng thái DRAFT.",
        type: "error",
      });
      return;
    }

    // locate item and parent sub
    let itemStatus: string | null = null;
    let parentSub: any = null;
    (expandedLocalDoc.subPurchaseOrders || []).forEach((s: any) => {
      (s.items || []).forEach((it: any) => {
        if (String(resolveId(it)) === idStr) {
          itemStatus = it.status ?? "DRAFT";
          parentSub = s;
        }
      });
    });

    if (!itemStatus) {
      toaster.create({ description: "Item không tồn tại.", type: "error" });
      return;
    }
    if (itemStatus !== "DRAFT") {
      toaster.create({
        description: "Chỉ có thể thay đổi trạng thái item khi nó đang ở DRAFT.",
        type: "error",
      });
      return;
    }

    // If changing to PENDINGAPPROVAL, ask confirm
    if (newStatus === "PENDINGAPPROVAL") {
      const ok = await confirm({
        title: "Confirm change",
        description:
          "Xác nhận chuyển item này sang trạng thái PENDINGAPPROVAL? Sau khi xác nhận, không thể chỉnh sửa.",
        confirmText: "Confirm",
        cancelText: "Cancel",
        destructive: true,
      });
      if (!ok) {
        return;
      }
    }

    // optimistic update
    setExpandedLocalDoc((prev: any) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      (copy.subPurchaseOrders || []).forEach((s: any) => {
        (s.items || []).forEach((it: any) => {
          if (String(resolveId(it)) === idStr) {
            it.status = newStatus;
          }
        });
      });
      syncTotalsToOrders(copy);
      return copy;
    });

    try {
      await updatePoItem({ id: idStr, body: { status: newStatus } }).unwrap();
      // if item moved to PENDINGAPPROVAL, keep readonly state (selects disabled by UI)
    } catch (err: any) {
      console.error("Update item status failed", err);
      await safeRefetchSubs();
      toaster.create({
        description:
          "Update failed: " + (err?.data?.message || err?.message || "unknown"),
        type: "error",
      });
    }
  };

  // Delete item (only if allowed)
  const handleDeleteServerItem = async (itemRaw: any) => {
    const idStr = String(resolveId(itemRaw));
    // check editability via expandedLocalDoc
    if (!expandedLocalDoc) {
      toaster.create({
        description: "Cannot delete - data not loaded.",
        type: "error",
      });
      return;
    }
    const parentPOId = String(
      expandedLocalDoc._id ?? expandedLocalDoc.id ?? expandedPoId ?? ""
    );
    const parentPO = orders.find((o) => String(o.id) === String(parentPOId));
    if (!parentPO || parentPO.status !== "DRAFT") {
      toaster.create({
        description: "Only deletable when PO is DRAFT.",
        type: "error",
      });
      return;
    }
    // ensure item and parent sub are DRAFT
    let itemStatus: string | null = null;
    let parentSubStatus: string | null = null;
    (expandedLocalDoc.subPurchaseOrders || []).forEach((s: any) => {
      (s.items || []).forEach((it: any) => {
        if (String(resolveId(it)) === idStr) {
          itemStatus = it.status ?? "DRAFT";
          parentSubStatus = s.status ?? "DRAFT";
        }
      });
    });
    if (itemStatus !== "DRAFT" || parentSubStatus !== "DRAFT") {
      toaster.create({
        description: "Only deletable when PO/Sub-PO/Item are DRAFT.",
        type: "error",
      });
      return;
    }

    const ok = await confirm({
      title: "Delete item",
      description: "Delete this item?",
      confirmText: "Delete",
      cancelText: "Cancel",
      destructive: true,
    });
    if (!ok) return;

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
      await safeRefetchSubs();
      toaster.create({
        description:
          "Delete failed: " + (err?.data?.message || err?.message || "unknown"),
        type: "error",
      });
    }
  };

  // Delete sub (only when allowed)
  const handleDeleteServerSub = async (subRaw: any) => {
    const subId = String(resolveId(subRaw));
    if (!expandedLocalDoc) {
      toaster.create({ description: "Data not loaded.", type: "error" });
      return;
    }
    const parentPOId = String(
      expandedLocalDoc._id ?? expandedLocalDoc.id ?? expandedPoId ?? ""
    );
    const parentPO = orders.find((o) => String(o.id) === String(parentPOId));
    if (!parentPO || parentPO.status !== "DRAFT") {
      toaster.create({
        description: "Only deletable when PO is DRAFT.",
        type: "error",
      });
      return;
    }
    // find sub in expandedLocalDoc
    const sub = (expandedLocalDoc.subPurchaseOrders || []).find(
      (x: any) => String(resolveId(x)) === subId
    );
    if (!sub || (sub.status ?? "DRAFT") !== "DRAFT") {
      toaster.create({
        description: "Only deletable when Sub-PO is DRAFT.",
        type: "error",
      });
      return;
    }

    const ok = await confirm({
      title: "Delete Sub-PO",
      description: "Xác nhận xóa sản phẩm này?",
      confirmText: "Delete",
      cancelText: "Cancel",
      destructive: true,
    });
    if (!ok) return;

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
      await safeRefetchSubs();
      toaster.create({
        description:
          "Xóa sản phẩm thất bại: " +
          (err?.data?.message || err?.message || "unknown"),
        type: "error",
      });
    }
  };

  // Handler: update PO status with propagation
  const handleUpdatePoStatus = async (poId: string, newStatus: string) => {
    const po = orders.find((o) => String(o.id) === String(poId));
    if (!po) {
      toaster.create({ description: "PO not found", type: "error" });
      return;
    }
    if (po.status !== "DRAFT") {
      toaster.create({
        description: "Only editable when PO is DRAFT.",
        type: "error",
      });
      return;
    }
    if (newStatus === po.status) return;

    // Only allow transition from DRAFT. If target is PENDINGAPPROVAL, propagate.
    if (newStatus === "PENDINGAPPROVAL") {
      const ok = await confirm({
        title: "Confirm change PO",
        description:
          "Xác nhận chuyển PO này sang PENDINGAPPROVAL? Sau khi xác nhận, PO và toàn bộ Sub-PO và Item sẽ được khoá.",
        confirmText: "Confirm",
        cancelText: "Cancel",
        destructive: true,
      });
      if (!ok) {
        return;
      }
      try {
        // update PO
        await updatePo({
          id: poId,
          body: { status: "PENDINGAPPROVAL" },
        }).unwrap();

        // fetch sub list (either from snapshot or expandedLocalDoc)
        // prefer server snapshot from orders
        const poSnapshot =
          orders.find((o) => String(o.id) === String(poId)) ?? po;
        const subs = (poSnapshot as any).subPOs ?? [];

        // if expanded and fetched, use expandedLocalDoc list instead (to catch ids)
        let subsToUpdate = subs;
        if (
          expandedLocalDoc &&
          String(resolveId(expandedLocalDoc)) === String(poId)
        ) {
          subsToUpdate = expandedLocalDoc.subPurchaseOrders || subs;
        }

        // update each sub and its items to PENDINGAPPROVAL
        for (const s of subsToUpdate) {
          const sid = String(resolveId(s));
          try {
            await updateSub({
              id: sid,
              body: { status: "PENDINGAPPROVAL" },
            }).unwrap();
          } catch (e) {
            // continue but log
            console.warn("updateSub failed for", sid, e);
          }
          // update items
          const items = s.items || [];
          for (const it of items) {
            const iid = String(resolveId(it));
            try {
              await updatePoItem({
                id: iid,
                body: { status: "PENDINGAPPROVAL" },
              }).unwrap();
            } catch (e) {
              console.warn("updatePoItem failed for", iid, e);
            }
          }
        }

        // refresh lists
        await safeRefetchSubs();
        try {
          if (typeof refetch === "function") await refetch();
        } catch (e) {
          console.warn("refetch purchase orders failed", e);
        }
      } catch (err: any) {
        console.error("Update PO status failed", err);
        try {
          if (typeof refetch === "function") await refetch();
        } catch (e) {
          console.warn("refetch purchase orders failed", e);
        }
        toaster.create({
          description:
            "Update PO status failed: " +
            (err?.data?.message || err?.message || "unknown"),
          type: "error",
        });
      }
    } else {
      // Allow update to APPROVED directly (no propagation) from DRAFT
      try {
        await updatePo({ id: poId, body: { status: newStatus } }).unwrap();
        try {
          if (typeof refetch === "function") await refetch();
        } catch (e) {
          console.warn("refetch purchase orders failed", e);
        }
      } catch (err: any) {
        console.error("Update PO status failed", err);
        try {
          if (typeof refetch === "function") await refetch();
        } catch (e) {
          console.warn("refetch purchase orders failed", e);
        }
        toaster.create({
          description:
            "Update PO status failed: " +
            (err?.data?.message || err?.message || "unknown"),
          type: "error",
        });
      }
    }
  };

  // Handler: update Sub status with propagation to items when going to pending
  const handleUpdateSubStatus = async (subIdRaw: any, newStatus: string) => {
    const subId = String(resolveId(subIdRaw));
    if (!expandedLocalDoc) {
      toaster.create({ description: "Data not loaded.", type: "error" });
      return;
    }
    const poId = String(
      expandedLocalDoc._id ?? expandedLocalDoc.id ?? expandedPoId ?? ""
    );
    const poSnapshot = orders.find((o) => String(o.id) === String(poId));
    if (!poSnapshot || poSnapshot.status !== "DRAFT") {
      toaster.create({
        description: "Only editable when PO is DRAFT.",
        type: "error",
      });
      return;
    }

    // find sub and current status
    const sub = (expandedLocalDoc.subPurchaseOrders || []).find(
      (s: any) => String(resolveId(s)) === subId
    );
    const current = sub?.status ?? "DRAFT";
    if (current !== "DRAFT") {
      toaster.create({
        description: "Only editable when Sub-PO is DRAFT.",
        type: "error",
      });
      return;
    }
    if (newStatus === current) return;

    if (newStatus === "PENDINGAPPROVAL") {
      const ok = await confirm({
        title: "Confirm change Sub-PO",
        description:
          "Xác nhận chuyển Sub-PO này sang PENDINGAPPROVAL? Sau khi xác nhận, Sub-PO và toàn bộ Item bên trong sẽ bị khoá.",
        confirmText: "Confirm",
        cancelText: "Cancel",
        destructive: true,
      });
      if (!ok) {
        return;
      }
      try {
        // update sub
        await updateSub({
          id: subId,
          body: { status: "PENDINGAPPROVAL" },
        }).unwrap();
        // update all its items to pending
        const items = sub.items || [];
        for (const it of items) {
          const iid = String(resolveId(it));
          try {
            await updatePoItem({
              id: iid,
              body: { status: "PENDINGAPPROVAL" },
            }).unwrap();
          } catch (e) {
            console.warn("updatePoItem failed for", iid, e);
          }
        }
        await safeRefetchSubs();
      } catch (err: any) {
        console.error("Update sub-PO status failed", err);
        await safeRefetchSubs();
        toaster.create({
          description:
            "Update failed: " +
            (err?.data?.message || err?.message || "unknown"),
          type: "error",
        });
      }
    } else {
      // APPROVED allowed directly from DRAFT (no propagation)
      try {
        await updateSub({ id: subId, body: { status: newStatus } }).unwrap();
        await safeRefetchSubs();
      } catch (err: any) {
        console.error("Update sub-PO status failed", err);
        await safeRefetchSubs();
        toaster.create({
          description:
            "Update failed: " +
            (err?.data?.message || err?.message || "unknown"),
          type: "error",
        });
      }
    }
  };

  const handleUpdateSubDeliveryDate = async (
    subIdRaw: any,
    newDateStr: string
  ) => {
    const subId = String(resolveId(subIdRaw));
    if (!expandedLocalDoc) {
      toaster.create({ description: "Data not loaded.", type: "error" });
      return;
    }
    const poId = String(
      expandedLocalDoc._id ?? expandedLocalDoc.id ?? expandedPoId ?? ""
    );
    const poSnapshot = orders.find((o) => String(o.id) === String(poId));
    if (!poSnapshot || poSnapshot.status !== "DRAFT") {
      toaster.create({
        description: "Only editable when PO is DRAFT.",
        type: "error",
      });
      return;
    }
    // check sub status
    const sub = (expandedLocalDoc.subPurchaseOrders || []).find(
      (s: any) => String(resolveId(s)) === subId
    );
    if (!sub || (sub.status ?? "DRAFT") !== "DRAFT") {
      toaster.create({
        description: "Chỉ có thể chỉnh ngày giao khi Sub-PO đang DRAFT.",
        type: "error",
      });
      return;
    }

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
      await safeRefetchSubs();
    } catch (err: any) {
      console.error("Update sub-PO delivery failed", err);
      await safeRefetchSubs();
      toaster.create({
        description:
          "Update failed: " + (err?.data?.message || err?.message || "unknown"),
        type: "error",
      });
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
          onClick={() =>
            toaster.create({
              description: "Nhập Excel - not implemented",
              type: "info",
            })
          }
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

            const usedSubs = expandedDocMatchesPo
              ? expandedLocalDoc.subPurchaseOrders || []
              : isExpanded
              ? serverSubs
              : po.subPOs || [];

            const totals = {
              items: po.totalItems ?? 0,
              value: po.totalValue ?? 0,
            };

            // editable only when PO is DRAFT
            const poEditable = po.status === "DRAFT";

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

                        <div
                          style={{
                            marginLeft: 12,
                            minWidth: 200,
                            maxWidth: 280,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ marginBottom: 8 }}>
                        <select
                          className="form-select form-select-sm"
                          value={po.status}
                          onChange={(e) =>
                            handleUpdatePoStatus(po.id, e.target.value)
                          }
                          disabled={!poEditable}
                        >
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
                          disabled={!poEditable}
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
                          disabled={!poEditable}
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
                          disabled={!poEditable}
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
                            const subStatus = s.status ?? "DRAFT";
                            const subEditable =
                              po.status === "DRAFT" && subStatus === "DRAFT";

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

                                    <div style={{ textAlign: "right" }}>
                                      <div style={{ marginBottom: 6 }}>
                                        <select
                                          className="form-select form-select-sm"
                                          value={subStatus}
                                          onChange={(e) =>
                                            handleUpdateSubStatus(
                                              s._id ?? s.id,
                                              e.target.value
                                            )
                                          }
                                          disabled={!subEditable}
                                        >
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
                                          disabled={!subEditable}
                                        />

                                        <button
                                          className="btn btn-danger btn-sm"
                                          onClick={() =>
                                            handleDeleteServerSub(s)
                                          }
                                          disabled={!subEditable}
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
                                            const itemStatus =
                                              it.status ?? "DRAFT";
                                            const itemEditable =
                                              po.status === "DRAFT" &&
                                              subStatus === "DRAFT" &&
                                              itemStatus === "DRAFT";
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
                                                    value={itemStatus}
                                                    onChange={(e) =>
                                                      handleUpdateServerItemStatus(
                                                        it,
                                                        e.target.value
                                                      )
                                                    }
                                                    disabled={!itemEditable}
                                                  >
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
                                                    min={0}
                                                    step={1}
                                                    inputMode="numeric"
                                                    value={Number(
                                                      it.amount ?? 0
                                                    )}
                                                    onKeyDown={(e) => {
                                                      if (
                                                        e.key === "-" ||
                                                        e.key === "+" ||
                                                        e.key === "e" ||
                                                        e.key === "."
                                                      ) {
                                                        e.preventDefault();
                                                      }
                                                    }}
                                                    onChange={(e) => {
                                                      let v =
                                                        e.target.value === ""
                                                          ? 0
                                                          : Math.floor(
                                                              Number(
                                                                e.target.value
                                                              ) || 0
                                                            );
                                                      if (v < 0) v = 0;

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
                                                      let finalVal = Math.floor(
                                                        Number(
                                                          e.target.value || 0
                                                        ) || 0
                                                      );
                                                      if (finalVal < 0)
                                                        finalVal = 0;
                                                      handleUpdateServerItemAmount(
                                                        it,
                                                        finalVal
                                                      );
                                                    }}
                                                    onWheel={(e) => {
                                                      (
                                                        e.currentTarget as HTMLInputElement
                                                      ).blur();
                                                    }}
                                                    disabled={!itemEditable}
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
                                                      disabled={!itemEditable}
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

          // Prevent double submissions
          if (isCreatingSubs) return;
          setIsCreatingSubs(true);

          try {
            // Build a set of existing product ids for this purchase order
            const existingProductIds = new Set<string>();
            const poSnapshot = orders.find(
              (o) => String(o.id) === String(poId)
            );
            if (poSnapshot && Array.isArray(poSnapshot.subPOs)) {
              poSnapshot.subPOs.forEach((s: any) => {
                const pid = s.product?._id ?? s.product ?? s.productId;
                if (pid) existingProductIds.add(String(pid));
              });
            }
            // If we have expandedLocalDoc for that po, include them too
            if (
              expandedLocalDoc &&
              String(resolveId(expandedLocalDoc)) === String(poId)
            ) {
              (expandedLocalDoc.subPurchaseOrders || []).forEach((s: any) => {
                const pid = s.product?._id ?? s.product ?? s.productId;
                if (pid) existingProductIds.add(String(pid));
              });
            }

            const duplicates: string[] = [];
            const payloadProducts = selectedProducts.map((p: any) => {
              const productId = p.productId ?? p._id ?? p.unique_id;
              if (existingProductIds.has(String(productId)))
                duplicates.push(String(productId));
              // Force newly added products to DRAFT status regardless of p.status
              return {
                productId: productId,
                deliveryDate: p.deliveryDate,
                status: "DRAFT",
              };
            });

            if (duplicates.length > 0) {
              toaster.create({
                description: `Không thể thêm: có ${duplicates.length} sản phẩm đã tồn tại trong PO này.`,
                type: "error",
              });
              setIsCreatingSubs(false);
              return;
            }

            const payload = {
              purchaseOrderId: poId,
              products: payloadProducts,
            };

            await createSubFromProducts(payload).unwrap();

            // safe refetch of expanded subs (only attempts if the query has been started)
            await safeRefetchSubs();

            try {
              if (typeof refetch === "function") await refetch();
            } catch (e) {
              console.warn("refetch purchase orders failed", e);
            }

            setProductModalOpenForPo({ open: false });
          } catch (err: any) {
            console.error("Create sub-POs failed", err);
            toaster.create({
              description:
                "Create sub-POs failed: " +
                (err?.data?.message || err?.message || "unknown"),
              type: "error",
            });
          } finally {
            setIsCreatingSubs(false);
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
